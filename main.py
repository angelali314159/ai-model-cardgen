import subprocess
import sys
import json
import os
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def connect_to_database():
    """Connect to MongoDB Atlas database"""
    try:
        uri = os.getenv('ATLAS_URI')
        if not uri:
            print("❌ ATLAS_URI not found in .env file")
            return None
        
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        db = client.ModelCards
        db.command('ping')
        #print("✅ Successfully connected to MongoDB database: ModelCards")

        return db
    except Exception as e:
        print(f"❌ Database connection error: {str(e)}")
        return None

def check_model_exists(db, model_name):
    """Check if model exists in the database"""
    try:
        collection = db.ModelCardInfo
        query = {"name": model_name}
        
        print(f"🔍 Checking database for model: '{model_name}'")
        result = collection.find_one(query)
        
        if result:
            print("✅ Document found!")
            return True, result
        else:
            print("❌ No document found in database")     
            return False, None
    except Exception as e:
        print(f"❌ Error during query: {str(e)}")
        return False, None

def display_existing_model(model_data):
    """Display information about existing model"""
    print("\n📊 Existing Model Information:")
    print("=" * 50)
    
    # Display like test_card_info.js does
    print(f"   • Document ID: {model_data.get('_id')}")
    print(f"   • Model Name: {model_data.get('name', 'Not specified')}")
    print(f"   • Total Fields: {len(model_data.keys())}")
    print(f"   • Field Names: [{', '.join(model_data.keys())}]")
    
    # Show specific fields like in the sample document
    important_fields = ['review_name', 'reviewer_email', 'regulatory_org', 'regulatory_info', 'clinical_impact_2']
    print("\n🔑 Important Fields:")
    for field in important_fields:
        if model_data.get(field):
            value = str(model_data[field])
            display_value = value[:100] + "..." if len(value) > 100 else value
            print(f"   • {field}: {display_value}")
        else:
            print(f"   • {field}: Not found")

def run_generate_model(model_name, developer_name):
    """Run the generate_model.py script"""
    try:
        print(f"\n🚀 Running model card generation for '{model_name}'...")
        print("=" * 60)
        
        # Check if generate_model.py exists
        if not os.path.exists('generate_model.py'):
            print("❌ generate_model.py not found in current directory")
            print(f"Current directory: {os.getcwd()}")
            print(f"Python files: {[f for f in os.listdir('.') if f.endswith('.py')]}")
            return False
        
        # Run generate_model.py as a subprocess
        result = subprocess.run([
            sys.executable, 'generate_model.py'
        ], 
        input=f"{model_name}\n{developer_name}\n", 
        text=True, 
        capture_output=True,
        cwd=os.getcwd()
        )
        
        if result.returncode == 0:
            print("✅ Model card generation completed successfully!")
            print("\n📄 Output:")
            print(result.stdout)
        else:
            print("❌ Model card generation failed!")
            print(f"Error: {result.stderr}")
            print(f"Return code: {result.returncode}")
            
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ Error running generate_model.py: {str(e)}")
        return False

def get_user_input():
    """Get model name and developer name from user"""
    print("🔧 AI Model Card System")
    print("=" * 40)
    
    try:
        # Get model name from user
        model_name = input("Enter the model name to check/generate: ").strip()
        if not model_name:
            print("❌ Model name is required")
            return None, None
        
        # Get developer name from user (optional for database check)
        developer_name = input("Enter the developer name (optional): ").strip()
        if not developer_name:
            print("⚠️  No developer name provided, will use default if generation is needed")
            developer_name = "Unknown Developer"
        
        print(f"\n📝 Note: Database check will only use model name '{model_name}'")
        print(f"📝 Developer name '{developer_name}' will only be used if generation is needed")
        
        return model_name, developer_name
        
    except KeyboardInterrupt:
        print("\n\n❌ Operation cancelled by user")
        return None, None
    except Exception as e:
        print(f"❌ Error getting user input: {str(e)}")
        return None, None


def main():
    """Main function that orchestrates the entire process"""
    print("🚀 AI Model Card System Starting...")
    print("=" * 60)
    
    # Get user input
    model_name, developer_name = get_user_input()
    
    if not model_name:
        print("Exiting...")
        return
    
    print(f"\n📋 Processing:")
    print(f"   • Model Name (for DB check): {model_name}")
    print(f"   • Developer Name (for generation only): {developer_name}")
    print("-" * 40)
    
    # Connect to database using same logic as connection.js
    db = connect_to_database()
    if db is None:
        print("⚠️  Database connection failed, proceeding with generation...")
        success = run_generate_model(model_name, developer_name)
        return
    
    # Check if model exists in database using same logic as test_card_info.js
    exists, model_data = check_model_exists(db, model_name)
    
    if exists:
        # Model exists in database
        display_existing_model(model_data)
        print("✅ Using existing model card from database.")
            
    else:
        # Model doesn't exist, generate it
        print(f"📝 Model '{model_name}' not found in database.")
        print("🔄 Generating new model card...")
        success = run_generate_model(model_name, developer_name)
        
        if success:
            # Check if the model was added to database after generation
            print("\n🔍 Checking if model was added to database...")
            exists_now, new_data = check_model_exists(db, model_name)
            if exists_now:
                print("✅ Model successfully added to database!")
            else:
                print("⚠️  Model generated but not found in database")
    
    print("\n" + "=" * 60)
    print("🏁 AI Model Card System completed.")
    print("=" * 60)

if __name__ == "__main__":
    main()