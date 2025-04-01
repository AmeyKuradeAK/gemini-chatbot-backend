require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

// CORS configuration: Only allow requests from a specific frontend domain
const allowedOrigins = ['https://gemini-chatbot-frontend-zeta.vercel.app/']; // Replace with your actual frontend URL

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Check if API key is set correctly (log temporarily for debugging)
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set!");
} else {
  console.log("GEMINI_API_KEY is set correctly");
}

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Ensure message exists
    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Make request to Gemini API
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [{ role: "user", parts: [{ text: userMessage }] }]
      },
      {
        params: { key: GEMINI_API_KEY },
        headers: { "Content-Type": "application/json" }
      }
    );

    console.log("Gemini API Response:", JSON.stringify(response.data, null, 2));

    // Extract the reply
    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
    res.json({ reply });

  } catch (error) {
    // Detailed error handling
    if (error.response) {
      console.error("Gemini API Error Response:", error.response.data);
      res.status(500).json({ error: error.response.data?.error || "Failed to fetch response from Gemini." });
    } else if (error.request) {
      console.error("Error with request to Gemini API:", error.request);
      res.status(500).json({ error: "Network error while contacting Gemini API." });
    } else {
      console.error("Unexpected error:", error.message);
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
});

app.listen(5000, () => console.log("✅ Server running on port 5000"));
