import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

# Get the API key from environment variables
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    print("❌ No Gemini API key found in .env file")
    exit(1)

# Configure the Gemini API
genai.configure(api_key=api_key)

try:
    # Initialize the model with correct name
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    # Make a simple API call to test the key
    response = model.generate_content("Say 'Hello, your Gemini API key works!'")
    
    print("\n✅ Gemini API key is working!")
    print(f"Response: {response.text}")
    
except Exception as e:
    if "API_KEY_INVALID" in str(e) or "invalid API key" in str(e).lower():
        print("❌ Invalid Gemini API key")
    elif "quota" in str(e).lower() or "limit" in str(e).lower():
        print("❌ API quota exceeded or rate limit hit")
    else:
        print(f"❌ Error: {e}")