print(">> crawler starting…"); import sys; sys.stdout.flush()

import time
TIME_BUDGET_SEC = 2 * 60     # 2 minutes
t0 = time.time()

import re, json, queue, requests, tldextract
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urldefrag
from urllib.robotparser import RobotFileParser
from datetime import datetime
from fill_card import extract_model_info, save_extracted_info, display_extracted_info  # reuse your pipeline

HEADERS = {"User-Agent": "ModelCardBot/0.1 (+research; polite crawl)"}

# ---- Config knobs ----
SEEDS = [
    "https://developers.google.com/health-ai-developer-foundations/",
    "https://huggingface.co/google/derm-foundation",
    "https://research.google/blog/health-specific-embedding-tools-for-dermatology-and-pathology/"
]
ALLOWED_DOMAINS = {"google.com", "huggingface.co", "research.google"}  # keep this small at first
KEYWORD_ALLOWLIST = re.compile(r"(model card|model-card|card|documentation|AI|health|derm|vision)", re.I)
DENY_FILETYPES = re.compile(r"\.(jpg|jpeg|png|gif|svg|pdf|zip|tar|gz|mp4|pptx|docx|xlsx)([?#].*)?$", re.I)
MAX_PAGES_TOTAL = 150
MAX_PAGES_PER_DOMAIN = 50
CRAWL_DELAY_SEC = 1.0
TIMEOUT = 10
MAX_DEPTH = 3

def domain_key(url):
    ext = tldextract.extract(url)
    return f"{ext.domain}.{ext.suffix}"

def allowed(url):
    if DENY_FILETYPES.search(url): return False
    dk = domain_key(url)
    return (not ALLOWED_DOMAINS) or (dk in ALLOWED_DOMAINS)

def get_robots(url):
    parts = requests.utils.urlparse(url)
    robots_url = f"{parts.scheme}://{parts.netloc}/robots.txt"
    rp = RobotFileParser()
    try:
        rp.set_url(robots_url); rp.read()
    except Exception:
        pass
    return rp

def is_relevant(text, title):
    blob = (title or "") + "\n" + (text or "")
    return bool(KEYWORD_ALLOWLIST.search(blob))

def crawl(user_model=None, user_dev=None):
    q = queue.Queue()
    for s in SEEDS:
        q.put((s, 0))
    seen = set()
    per_domain_counts = {}
    robots_cache = {}
    total = 0

    while not q.empty() and total < MAX_PAGES_TOTAL:
        url, depth = q.get()
        url, _ = urldefrag(url)          # drop fragments
        if url in seen: continue
        if depth > MAX_DEPTH: continue
        if not allowed(url): continue
        seen.add(url)

        dk = domain_key(url)
        per_domain_counts.setdefault(dk, 0)
        if per_domain_counts[dk] >= MAX_PAGES_PER_DOMAIN: 
            continue

        # robots
        base = f"{requests.utils.urlparse(url).scheme}://{requests.utils.urlparse(url).netloc}"
        rp = robots_cache.get(base)
        if rp is None:
            rp = get_robots(url)
            robots_cache[base] = rp
        if rp and hasattr(rp, "can_fetch") and not rp.can_fetch(HEADERS["User-Agent"], url):
            continue

        try:
            resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            if "text/html" not in resp.headers.get("Content-Type",""):
                continue
            html = resp.text
        except Exception:
            continue

        per_domain_counts[dk] += 1
        total += 1

        soup = BeautifulSoup(html, "html.parser")
        title = soup.title.string.strip() if soup.title and soup.title.string else ""
        body_text = soup.get_text("\n", strip=True)
        body_preview = body_text[:500] + ("..." if len(body_text) > 500 else "")

        # If relevant, pass page to your extractor (keeps your pipeline intact)
        if is_relevant(body_text, title):
            scraped_data = {
                "success": True,
                "url": url,
                "title": title,
                "current_url": url,
                "page_source_length": len(html),
                "timestamp": time.time(),
                "meta_description": None,
                "body_text_length": len(body_text),
                "body_text_preview": body_preview
            }
            # OPTIONAL: provide hints to the extractor
            model_name_hint = title or "Unknown Model"
            developer_name_hint = domain_key(url)
            extracted = extract_model_info(scraped_data, model_name_hint, developer_name_hint)  # uses fill_card.py
            display_extracted_info(extracted)
            if "error" not in extracted:
                # Save one JSON per page to avoid overwriting
                safe_name = re.sub(r"[^a-zA-Z0-9]+", "_", title)[:60] or "page"
                save_extracted_info(extracted, filename=f"extracted_{safe_name}.json")

        # Enqueue new links (polite BFS)
        for a in soup.find_all("a", href=True):
            nxt = urljoin(url, a["href"].strip())
            if nxt.startswith("mailto:") or nxt.startswith("javascript:"):
                continue
            if allowed(nxt) and nxt not in seen:
                q.put((nxt, depth + 1))

        time.sleep(CRAWL_DELAY_SEC)

if __name__ == "__main__":
    print("🔧 Model Card Generator Crawler")
    user_model = input("Enter model name (or press Enter to auto-detect): ").strip() or None
    user_dev = input("Enter developer name (or press Enter to auto-detect): ").strip() or None

    crawl(user_model, user_dev)

