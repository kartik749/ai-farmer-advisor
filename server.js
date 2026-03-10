import Groq from "groq-sdk";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({
 apiKey: process.env.GROQ_API_KEY
});

console.log(process.env.GROQ_API_KEY);
app.post("/advice", async (req,res)=>{

const {crop,soil,weather,language} = req.body;

let prompt = `
You are an expert agriculture advisor.

Crop: ${crop}
Soil: ${soil}
Weather: ${weather}

Give irrigation advice, fertilizer recommendation,
pest prevention and sustainable farming tips.
`;

if(language === "hindi"){
prompt += "Give the answer in Hindi.";
}

try{

const chat = await groq.chat.completions.create({
messages:[{role:"user",content:prompt}],
model:"llama-3.1-8b-instant"
});

res.json({
advice: chat.choices[0].message.content
});

}catch(err){

console.error(err);

res.json({
advice:"AI service temporarily unavailable."
});

}
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});