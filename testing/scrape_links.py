#!/usr/bin/env python3
"""
Scrape a list of URLs from a CSV file and write aggregated content to a markdown file.
Uses the WebScraper class defined in `src/web_scraper.py`.

Default behavior:
  - Reads `testing/derm_foundation_links.csv`
  - Writes aggregated output to `testing/derm_foundation_website.md` (backing up existing file)

Usage:
  python3 testing/scrape_links.py
  python3 testing/scrape_links.py --csv testing/derm_foundation_links.csv --out testing/derm_foundation_website.md --headless
"""
import argparse
import csv
import os
import time
from pathlib import Path

# Ensure the repository root is on sys.path so `from src.web_scraper` works
import sys
repo_root = Path(__file__).resolve().parent.parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from src.web_scraper import WebScraper


def read_links(csv_path):
    links = []
    with open(csv_path, newline='', encoding='utf-8') as f:
        for row in csv.reader(f):
            if not row:
                continue
            url = row[0].strip()
            if url and not url.startswith('#'):
                links.append(url)
    return links


def aggregate_scrapes(scrapes):
    parts = [f"# Aggregated scrape - {time.ctime()}\n"]
    for i, item in enumerate(scrapes, start=1):
        parts.append(f"## {i}. {item.get('title') or item.get('url')}\n")
        parts.append(f"- Source URL: {item.get('url')}")
        parts.append(f"- Final URL: {item.get('current_url')}")
        parts.append(f"- Timestamp: {time.ctime(item.get('timestamp')) if item.get('timestamp') else 'N/A'}\n")

        meta = item.get('meta_description')
        if meta:
            parts.append(f"**Meta description:** {meta}\n")

        preview = item.get('body_text_preview') or ''
        if preview:
            parts.append("```")
            parts.append(preview)
            parts.append("```")
        else:
            parts.append('_No text preview available_')

        parts.append('\n---\n')

    return '\n'.join(parts)


def backup_file(path: Path):
    if path.exists():
        ts = int(time.time())
        backup = path.with_name(path.name + f'.bak.{ts}')
        path.replace(backup)
        print(f'Backed up existing {path} to {backup}')


def main(csv_file, out_file, headless, timeout_per_page, max_pages):
    csv_path = Path(csv_file)
    out_path = Path(out_file)

    if not csv_path.exists():
        print(f'CSV file not found: {csv_path}')
        return 2

    links = read_links(csv_path)
    if not links:
        print('No links found in CSV.')
        return 0

    scraper = WebScraper(headless=headless)
    if not scraper.setup_driver():
        print('Failed to initialize web driver. Exiting.')
        return 3

    scrapes = []
    try:
        for i, url in enumerate(links):
            if max_pages and i >= max_pages:
                break
            print(f'Scraping ({i+1}/{len(links)}): {url}')
            result = scraper.scrape_website(url, timeout=timeout_per_page)
            if not result.get('success'):
                print(f"  Error scraping {url}: {result.get('error')}")
                # include an entry with the error
                scrapes.append({'url': url, 'title': None, 'current_url': None, 'meta_description': None, 'body_text_preview': f"ERROR: {result.get('error')}", 'timestamp': time.time()})
            else:
                scrapes.append(result)
            # small delay to be polite
            time.sleep(0.5)
    finally:
        scraper.close()

    # Backup existing file before writing
    backup_file(out_path)

    aggregated = aggregate_scrapes(scrapes)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(aggregated, encoding='utf-8')
    print(f'Wrote aggregated scrape to {out_path} ({len(scrapes)} pages)')
    return 0


if __name__ == '__main__':
    script_dir = Path(__file__).resolve().parent
    default_csv = script_dir / 'derm_foundation_links.csv'
    default_out = script_dir / 'derm_foundation_website.md'

    parser = argparse.ArgumentParser(description='Scrape a list of URLs and aggregate content')
    parser.add_argument('--csv', default=str(default_csv), help='CSV file with one URL per line')
    parser.add_argument('--out', default=str(default_out), help='Output markdown file to write aggregated content')
    parser.add_argument('--headless', action='store_true', default=True, help='Run browser in headless mode (default: true)')
    parser.add_argument('--timeout', type=int, default=15, help='Timeout per page load in seconds')
    parser.add_argument('--max-pages', type=int, default=0, help='Max number of pages to scrape (0 means all)')

    args = parser.parse_args()
    # argparse sets headless True when flag present; allow default True
    rc = main(args.csv, args.out, args.headless, args.timeout, args.max_pages)
    raise SystemExit(rc)
