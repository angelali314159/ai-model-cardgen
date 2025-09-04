from web_scraper import WebScraper
from fill_card import extract_model_info, display_extracted_info, save_extracted_info
import json
from datetime import datetime

def main(model_name="Derm Foundation", developer_name="Google Developer"):
    """
    Main function to scrape Google Health AI Developer Foundations page
    
    Args:
        model_name (str): Name of the AI model
        developer_name (str): Name of the model developer
    """
    
    # Target URL
    target_url = "https://developers.google.com/health-ai-developer-foundations/derm-foundation/model-card"
    
    print("=" * 60)
    print("AI Model Card Generator - Web Scraping Module")
    print("=" * 60)
    print(f"Target URL: {target_url}")
    print(f"Model Name: {model_name}")
    print(f"Developer Name: {developer_name}")
    print("-" * 60)
    
    # Initialize web scraper
    scraper = WebScraper(headless=True)
    
    try:
        # Scrape the website
        print("🔍 Starting web scraping...")
        result = scraper.scrape_website(target_url, timeout=15)
        
        if result["success"]:
            print("✅ Scraping completed successfully!")
            print("\n📊 Scraped Data Summary:")
            print(f"   • Title: {result['title']}")
            print(f"   • URL: {result['current_url']}")
            print(f"   • Page source length: {result['page_source_length']:,} characters")
            print(f"   • Body text length: {result['body_text_length']:,} characters")
            print(f"   • Meta description: {result['meta_description'][:100] if result['meta_description'] else 'None'}...")
            print(f"   • Timestamp: {datetime.fromtimestamp(result['timestamp']).strftime('%Y-%m-%d %H:%M:%S')}")
            
            print("\n📝 Content Preview (first 300 characters):")
            print("-" * 40)
            print(result['body_text_preview'][:300] + "...")
            print("-" * 40)
            
            # Add model and developer info to scraped data
            result["provided_model_name"] = model_name
            result["provided_developer_name"] = developer_name
            
            # Save scraped data to JSON file
            output_file = "scraped_data.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            
            print(f"\n💾 Data saved to: {output_file}")
            
            # Extract model information using Gemini API
            print("\n" + "=" * 60)
            print("AI Model Information Extraction")
            print("=" * 60)
            
            extracted_info = extract_model_info(result, model_name, developer_name)
            display_extracted_info(extracted_info)
            
            if "error" not in extracted_info:
                save_extracted_info(extracted_info)
            
            return result, extracted_info
            
        else:
            print("❌ Scraping failed!")
            print(f"Error: {result['error']}")
            return None, None
            
    except Exception as e:
        print(f"❌ Unexpected error occurred: {str(e)}")
        return None, None
        
    finally:
        # Always close the scraper
        scraper.close()
        print("\n🔒 Browser session closed.")

def get_user_input():
    """Get model name and developer name from user input"""
    print("🔧 AI Model Card Generator Setup")
    print("=" * 40)
    
    try:
        # Get model name from user
        user_model_name = input("Enter the model name: ").strip()
        if not user_model_name:
            print("⚠️  No model name provided, using default")
            user_model_name = None
        
        # Get developer name from user
        user_developer_name = input("Enter the developer name: ").strip()
        if not user_developer_name:
            print("⚠️  No developer name provided, using default")
            user_developer_name = None
        
        print(f"\n📝 User Input Received:")
        print(f"   • Model Name: {user_model_name if user_model_name else 'Not provided (will use default)'}")
        print(f"   • Developer Name: {user_developer_name if user_developer_name else 'Not provided (will use default)'}")
        
        return user_model_name, user_developer_name
        
    except KeyboardInterrupt:
        print("\n\n❌ Operation cancelled by user")
        return None, None
    except Exception as e:
        print(f"❌ Error getting user input: {str(e)}")
        return None, None

if __name__ == "__main__":
    # Get user input
    user_model, user_developer = get_user_input()
    
    # Check if user cancelled
    if user_model is None and user_developer is None:
        print("Exiting...")
        exit(0)
    
    # Use hardcoded values (for now, as requested)
    # Note: User input is collected but hardcoded values are still used
    hardcoded_model_name = "Derm Foundation"
    hardcoded_developer_name = "Google Developer"
    
    print(f"\n📋 Processing Information:")
    
    # Run the main scraping and extraction function with hardcoded values
    scraped_result, extracted_result = main(hardcoded_model_name, hardcoded_developer_name)
    
    print("\n" + "=" * 60)
    print("Script execution completed.")
    print("=" * 60)