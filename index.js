require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

// Enable CORS for all origins (for debugging purposes)
app.use(cors());

// Or specify a more restrictive policy by adding the origins you want to allow:
// const allowedOrigins = ['https://your-frontend-url.com', 'http://localhost:3000'];  
// app.use(cors({ origin: allowedOrigins }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/chat", async (req, res) => {
    console.log("Received message:", req.body.message);  // Log incoming message
    try {
        const userMessage = req.body.message;

        const response = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            {
                contents: [{ role: "user", parts: [{ text: userMessage }] }] 
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
