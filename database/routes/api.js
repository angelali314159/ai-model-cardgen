import express from "express";
import { spawn } from 'child_process';
import db from "../db/connection.js";

const router = express.Router();

router.post("/model-card", async (req, res) => {
    const { modelName, developerName } = req.body;
    
    if (!modelName) {
        return res.status(400).json({ error: "Model name is required" });
    }

    try {
        // First check if model exists in database
        const collection = db.collection("ModelCardInfo");
        const existingModel = await collection.findOne({ name: modelName });
        
        if (existingModel) {
            // Return existing model from database
            return res.json({
                source: 'database',
                data: existingModel,
                timestamp: Date.now()
            });
        }
        
        // Model not found, generate new one
        console.log(`Generating model card for: ${modelName}`);
        
        const pythonProcess = spawn('python', ['../main.py'], {
            cwd: process.cwd(),
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        // Send input to Python script
        pythonProcess.stdin.write(`${modelName}\n`);
        pythonProcess.stdin.write(`${developerName || 'Unknown Developer'}\n`);
        pythonProcess.stdin.end();
        
        let output = '';
        let errorOutput = '';
        
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        pythonProcess.on('close', async (code) => {
            if (code === 0) {
                // Check if model was added to database
                const newModel = await collection.findOne({ name: modelName });
                
                if (newModel) {
                    res.json({
                        source: 'generated',
                        data: newModel,
                        timestamp: Date.now()
                    });
                } else {
                    // Try to read from generated files
                    try {
                        const fs = await import('fs');
                        const extractedData = JSON.parse(
                            fs.readFileSync('../output/extracted_model_info.json', 'utf8')
                        );
                        
                        res.json({
                            source: 'generated',
                            data: extractedData,
                            timestamp: Date.now()
                        });
                    } catch (fileError) {
                        res.status(500).json({ 
                            error: "Model card generation completed but couldn't retrieve data",
                            details: output
                        });
                    }
                }
            } else {
                res.status(500).json({ 
                    error: "Model card generation failed",
                    details: errorOutput || output
                });
            }
        });
        
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ 
            error: "Internal server error",
            details: error.message 
        });
    }
});

export default router;