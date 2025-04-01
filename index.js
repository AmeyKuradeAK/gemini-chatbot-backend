require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

// Allow CORS from your frontend's origin (change it as per your frontend URL)
const allowedOrigins = ['https://gemini-chatbot-frontend-zeta.vercel.app/', 'http://localhost:3000'];  // Replace with your frontend URL

app.use(cors({
  origin: (origin, callback) => {
    console.log("Request origin:", origin); // Log request origin for debugging
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        const response = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            {
                contents: [{ role: "user", parts: [{ text: userMessage }] }], 
            },
            {
                params: { key: GEMINI_API_KEY },
                headers: { "Content-Type": "application/json" },
            }
        );

        console.log("Gemini Response:", JSON.stringify(response.data, null, 2));

        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
        res.json({ reply });
    } catch (error) {
        console.error("Gemini API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch response from Gemini." });
    }
});

app.listen(5000, () => console.log("✅ Server running on port 5000"));
