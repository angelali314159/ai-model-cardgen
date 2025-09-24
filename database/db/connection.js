import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the project root (two levels up from this file)
dotenv.config({ path: path.join(__dirname, '../../.env') });

const uri = process.env.ATLAS_URI;

if (!uri) {
  console.error('❌ ATLAS_URI not found in environment variables');
  console.error('Make sure the .env file exists at:', path.join(__dirname, '../../.env'));
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

try {
  // Connect the client to the server
  await client.connect();
  // Send a ping to confirm a successful connection
  await client.db("ModelCards").command({ ping: 1 });
  console.log(
   "✅ Pinged your deployment. You successfully connected to MongoDB!"
  );
} catch(err) {
  console.error('❌ MongoDB connection error:', err);
}

let db = client.db("ModelCards");

export default db;