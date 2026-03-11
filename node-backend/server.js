import Groq from "groq-sdk";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";

dotenv.config();

const app = express();

// Use CORS so your Frontend can talk to this Node server
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// 1. DYNAMIC CONFIGURATION: 
// This will use the Render Flask URL when deployed, and localhost during testing.
const FLASK_API_URL = process.env.FLASK_API_URL || "http://127.0.0.1:5000";

/* AI Advice (Groq) */
app.post("/advice", async (req, res) => {
  const { crop, soil, weather, language } = req.body;

  if (!crop || !soil || !weather) {
    return res.status(400).json({ advice: "Missing required fields." });
  }

  let prompt = `You are an expert agriculture advisor. Crop: ${crop} Soil: ${soil} Weather: ${weather} Give irrigation advice, fertilizer recommendation, pest prevention and sustainable farming tips.`;
  if (language === "hindi") prompt += "\nRespond in Hindi.";

  try {
    const chat = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant"
    });
    res.json({ advice: chat.choices[0].message.content });
  } catch (error) {
    console.error("Groq API Error:", error);
    res.status(500).json({ advice: "AI service temporarily unavailable." });
  }
});

/* ML Prediction (Flask) */
app.post("/predict-yield", async (req, res) => {
  try {
    // 2. MODIFIED: Use the FLASK_API_URL variable instead of hardcoded localhost
    const response = await fetch(`${FLASK_API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("Flask API Error:", err);
    res.status(500).json({ error: "Prediction service unavailable" });
  }
});

// 3. DYNAMIC PORT: Render assigns a port automatically
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});