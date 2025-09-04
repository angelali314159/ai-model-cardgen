import os
import json
import csv
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

def setup_gemini_api():
    """Setup and configure Gemini API"""
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        raise ValueError("❌ No Gemini API key found in .env file")
    
    # Configure the Gemini API
    genai.configure(api_key=api_key)
    
    try:
        # Initialize the model
        model = genai.GenerativeModel('gemini-2.0-flash')
        return model
    except Exception as e:
        raise Exception(f"Failed to initialize Gemini model: {str(e)}")

def load_wanted_fields():
    """Load the wanted fields from CSV file"""
    try:
        with open('list_of_wanted_fields.csv', 'r', encoding='utf-8') as file:
            reader = csv.reader(file)
            # Skip the comment line and get the actual field names
            for row in reader:
                if row and not row[0].strip().startswith('//'):
                    # Split the fields and clean them
                    fields = [field.strip() for field in row]
                    return fields
        return []
    except FileNotFoundError:
        print("❌ list_of_wanted_fields.csv file not found")
        return []
    except Exception as e:
        print(f"❌ Error reading CSV file: {str(e)}")
        return []

def create_extraction_prompt(scraped_content, wanted_fields, model_name=None, developer_name=None):
    """Create a prompt for Gemini to extract model card information"""
    
    fields_str = ", ".join(wanted_fields)
    
    
    # Add context about the provided model and developer names
    context_info = ""
    if model_name or developer_name:
        context_info = f"""
        **Additional Context:**
        • Provided Model Name: {model_name if model_name else 'Not provided'}
        • Provided Developer Name: {developer_name if developer_name else 'Not provided'}

        Use this information to help validate or supplement what you find in the website content.
        """
            
        prompt = f"""
        You are an AI assistant specialized in extracting information from web content to create comprehensive AI model cards. Your goal is to be as thorough and helpful as possible.

        I have scraped content from a website about an AI model, and I need you to extract specific information fields.

        **Website Content:**
        {scraped_content}
        {context_info}
        **Required Fields to Extract:**
        {fields_str}

        **Instructions:**
        1. Analyze the provided website content carefully and extract explicit information
        2. Use your best judgment and domain knowledge to make educated guesses when information is not explicitly stated
        3. For missing information, make reasonable inferences based on:
        - The type of AI model described
        - Common practices in the field
        - Context clues from the content
        - Industry standards for similar models
        4. Only use "Not found" as a last resort when no reasonable inference can be made
        5. Return results in valid JSON format with field names as keys
        6. Be thorough - aim to populate as many fields as possible with meaningful information
        7. For dates, use YYYY-MM-DD format if possible, or estimate based on context
        8. For keywords, provide comprehensive, relevant terms related to the model and its domain
        9. For technical fields, make educated guesses based on the model type and application
        10. For regulatory/compliance fields, consider the model's intended use and typical requirements

        **Guidelines for Making Educated Guesses:**
        - If it's a medical/healthcare AI, consider typical clinical validation requirements
        - If it's a foundation model, consider common training approaches and datasets
        - For intended users, think about who would typically use this type of model
        - For limitations, consider common limitations of similar AI models
        - For ethical considerations, think about typical concerns for this model type
        - For performance metrics, consider what would be standard for this domain

        **Expected JSON Output Format:**
        Return a complete JSON object with ALL fields from the CSV, making your best educated guesses where needed.

        Please provide only the JSON output, no additional text or explanations. Be comprehensive and thorough.
        """
    print(prompt)
    return prompt

def extract_model_info(scraped_data, model_name=None, developer_name=None):
    """Extract model card information using Gemini API"""
    
    print("🤖 Setting up Gemini API...")
    
    try:
        # Setup Gemini API
        model = setup_gemini_api()
        
        # Load wanted fields
        wanted_fields = load_wanted_fields()
        if not wanted_fields:
            return {"error": "Failed to load wanted fields from CSV"}
        
        print(f"📋 Fields to extract: {', '.join(wanted_fields)}")
        print(f"📝 Provided Model Name: {model_name}")
        print(f"📝 Provided Developer Name: {developer_name}")
        
        # Get the scraped content
        if not scraped_data or not scraped_data.get("success"):
            return {"error": "No valid scraped data provided"}
        
        # Use the full body text if available, otherwise use preview
        content = scraped_data.get("body_text_preview", "")
        if len(content) < 100:
            content = scraped_data.get("title", "") + " " + content
        
        print(f"📄 Content length: {len(content)} characters")
        print(f"Content: " + (content[:1000] + "..." if len(content) > 1000 else content))
        
        # Create extraction prompt with model and developer context
        prompt = create_extraction_prompt(content, wanted_fields, model_name, developer_name)
        
        print("🔍 Sending request to Gemini API...")
        
        # Generate response using Gemini
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            return {"error": "Empty response from Gemini API"}
        
        print("✅ Received response from Gemini API")
        print(f"Raw response: {response.text}")
        
        # Parse the JSON response - handle markdown code blocks
        try:
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]  # Remove ```json
            elif response_text.startswith("```"):
                response_text = response_text[3:]   # Remove ```
            
            if response_text.endswith("```"):
                response_text = response_text[:-3]  # Remove trailing ```
            
            response_text = response_text.strip()
            
            extracted_info = json.loads(response_text)
            
            # Add metadata
            extracted_info["extraction_timestamp"] = scraped_data.get("timestamp")
            extracted_info["source_url"] = scraped_data.get("url")
            extracted_info["extraction_method"] = "Gemini API"
            extracted_info["provided_model_name"] = model_name
            extracted_info["provided_developer_name"] = developer_name
            
            return extracted_info
            
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse JSON response: {str(e)}")
            print(f"Cleaned response: {response_text}")
            return {
                "error": "Failed to parse JSON response from Gemini",
                "raw_response": response.text
            }
            
    except ValueError as e:
        return {"error": str(e)}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

def save_extracted_info(extracted_info, filename="extracted_model_info.json"):
    """Save extracted information to JSON file"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(extracted_info, f, indent=2, ensure_ascii=False)
        print(f"💾 Extracted information saved to: {filename}")
        return True
    except Exception as e:
        print(f"❌ Failed to save extracted information: {str(e)}")
        return False

def display_extracted_info(extracted_info):
    """Display extracted information in a formatted way"""
    print("\n📊 Extracted Model Card Information:")
    print("=" * 50)
    
    if "error" in extracted_info:
        print(f"❌ Error: {extracted_info['error']}")
        if "raw_response" in extracted_info:
            print(f"Raw response: {extracted_info['raw_response']}")
        return
    
    for key, value in extracted_info.items():
        if key not in ["extraction_timestamp", "source_url", "extraction_method", "provided_model_name", "provided_developer_name"]:
            print(f"📌 {key.replace('_', ' ').title()}: {value}")
    
    print("\n📋 Metadata:")
    print(f"   • Source URL: {extracted_info.get('source_url', 'N/A')}")
    print(f"   • Extraction Method: {extracted_info.get('extraction_method', 'N/A')}")
    print(f"   • Provided Model Name: {extracted_info.get('provided_model_name', 'N/A')}")
    print(f"   • Provided Developer Name: {extracted_info.get('provided_developer_name', 'N/A')}")
    print(f"   • Timestamp: {extracted_info.get('extraction_timestamp', 'N/A')}")

if __name__ == "__main__":
    # Test with sample data (for development)
    print("🧪 Testing fill_card.py independently...")
    
    # Load scraped data if available
    try:
        with open('scraped_data.json', 'r', encoding='utf-8') as f:
            test_data = json.load(f)
        
        result = extract_model_info(test_data, "Derm Foundation", "Google Developer")
        display_extracted_info(result)
        
        if "error" not in result:
            save_extracted_info(result)
            
    except FileNotFoundError:
        print("❌ No scraped_data.json found. Run generate_model.py first.")
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")