import db from "../database/db/connection.js";

// ========================================
// USER INPUT: Change the model name here
// ========================================
const MODEL_NAME_TO_TEST = "DermaSensor";
// ========================================

async function testCardInfoQuery(modelName) {
    console.log("🧪 Testing CardInfo Query");
    console.log(`📝 Searching for model: "${modelName}"`);

    try {
        // Get the collection (same as in cardInfo.js)
        let collection = await db.collection("ModelCardInfo");
        
        // Create the same query as in the route
        let query = { name: modelName };
        
        console.log("🔍 Query being executed:", JSON.stringify(query, null, 2));
        
        // Execute the query
        let result = await collection.findOne(query);
        
        console.log("\n📊 Query Results:");
        
        if (!result) {
            console.log("❌ No document found");
            console.log("Status that would be returned: 404");
            
            // Let's check what documents exist in the collection
            console.log("\n🔍 Checking all documents in collection...");
            let allDocs = await collection.find({}).limit(10).toArray();
            console.log(`📋 Found ${allDocs.length} document(s) in collection:`);
            
            allDocs.forEach((doc, index) => {
                console.log(`\n📄 Document ${index + 1}:`);
                console.log(`   • _id: ${doc._id}`);
                console.log(`   • name: ${doc.name || 'No name field'}`);
                console.log(`   • Keys: [${Object.keys(doc).join(', ')}]`);
            });
            
        } else {
            console.log("✅ Document found!");
            console.log("Status that would be returned: 200");
            console.log("\n📋 Full Document Content:");
            console.log(JSON.stringify(result, null, 2));
            
            console.log("\n📊 Document Summary:");
            console.log(`   • Document ID: ${result._id}`);
            console.log(`   • Model Name: ${result.name || 'Not specified'}`);
            console.log(`   • Total Fields: ${Object.keys(result).length}`);
            console.log(`   • Field Names: [${Object.keys(result).join(', ')}]`);
        }
        
    } catch (error) {
        console.error("❌ Error during query:", error);
    }
    
    console.log("🏁 Test completed");
}


// Main execution
async function main() {
    console.log("🚀 CardInfo Route Test Starting...\n");
    
    try {
        // Test the specific name
        await testCardInfoQuery(MODEL_NAME_TO_TEST);
        
    } catch (error) {
        console.error("❌ Main execution error:", error);
    } finally {
        // Close the database connection
        process.exit(0);
    }
}

// Run the test
main();