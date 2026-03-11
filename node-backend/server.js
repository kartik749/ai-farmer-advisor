import Groq from "groq-sdk";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/* AI Advice */

app.post("/advice", async (req, res) => {

  const { crop, soil, weather, language } = req.body;

  if (!crop || !soil || !weather) {
    return res.status(400).json({
      advice: "Missing required fields."
    });
  }

  let prompt = `
You are an expert agriculture advisor.

Crop: ${crop}
Soil: ${soil}
Weather: ${weather}

Give irrigation advice, fertilizer recommendation,
pest prevention and sustainable farming tips.
`;

  if (language === "hindi") {
    prompt += "\nRespond in Hindi.";
  }

  try {

    const chat = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant"
    });

    res.json({
      advice: chat.choices[0].message.content
    });

  } catch (error) {

    console.error("Groq API Error:", error);

    res.status(500).json({
      advice: "AI service temporarily unavailable."
    });

  }

});

/* ML Prediction */

app.post("/predict-yield", async (req, res) => {

  try {

    const response = await fetch("http://127.0.0.1:5000/predict", {
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

    res.status(500).json({
      error: "Prediction service unavailable"
    });

  }

});

/* Server */

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});