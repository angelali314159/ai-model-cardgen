from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
import time

class WebScraper:
    def __init__(self, headless=True):
        """Initialize the web scraper with Chrome driver"""
        self.driver = None
        self.headless = headless
        
    def setup_driver(self):
        """Setup Chrome WebDriver with options"""
        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            return True
        except Exception as e:
            print(f"Error setting up driver: {e}")
            return False
    
    def scrape_website(self, url, timeout=10):
        """
        Scrape basic information from a website
        Returns dict with scraped data or error info
        """
        if not self.driver:
            if not self.setup_driver():
                return {"success": False, "error": "Failed to setup driver"}
        
        try:
            # Navigate to URL
            self.driver.get(url)
            
            # Wait for page to load
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Extract basic information
            scraped_data = {
                "success": True,
                "url": url,
                "title": self.driver.title,
                "current_url": self.driver.current_url,
                "page_source_length": len(self.driver.page_source),
                "timestamp": time.time()
            }
            
            # Try to get meta description
            try:
                meta_desc = self.driver.find_element(By.CSS_SELECTOR, 'meta[name="description"]')
                scraped_data["meta_description"] = meta_desc.get_attribute("content")
            except:
                scraped_data["meta_description"] = None
            
            # Get all text content
            try:
                body_text = self.driver.find_element(By.TAG_NAME, "body").text
                scraped_data["body_text_length"] = len(body_text)
                scraped_data["body_text_preview"] = body_text[:500] + "..." if len(body_text) > 500 else body_text
            except:
                scraped_data["body_text_length"] = 0
                scraped_data["body_text_preview"] = ""
            
            return scraped_data
            
        except TimeoutException:
            return {"success": False, "error": f"Timeout loading {url}"}
        except WebDriverException as e:
            return {"success": False, "error": f"WebDriver error: {str(e)}"}
        except Exception as e:
            return {"success": False, "error": f"Unexpected error: {str(e)}"}
    
    def close(self):
        """Close the browser driver"""
        if self.driver:
            self.driver.quit()
            self.driver = None

def test_scraper(url="https://httpbin.org/html"):
    """Test function to verify scraper works"""
    scraper = WebScraper(headless=True)
    
    print(f"Testing scraper with URL: {url}")
    result = scraper.scrape_website(url)
    
    if result["success"]:
        print("✅ Scraping successful!")
        print(f"Title: {result['title']}")
        print(f"Page source length: {result['page_source_length']}")
        print(f"Body text preview: {result['body_text_preview'][:100]}...")
    else:
        print("❌ Scraping failed!")
        print(f"Error: {result['error']}")
    
    scraper.close()
    return result

if __name__ == "__main__":
    # Test the scraper when run directly
    test_scraper()