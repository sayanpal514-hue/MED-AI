// ==============================
//  Medical AI - server.js
//  Node.js + Express Backend
// ==============================

require("dotenv").config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---- Gemini Client ----
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---- POST /api/analyze — Symptom Checker ----
app.post("/api/analyze", async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || symptoms.length === 0) {
    return res.status(400).json({ error: "No symptoms provided." });
  }

  const prompt = `You are a helpful medical AI assistant. A patient reports these symptoms: ${symptoms.join(", ")}.

Please provide:
1. **Possible Conditions** — List 3–4 possible medical conditions that match these symptoms (most likely first)
2. **Possible Causes** — Brief causes for these symptoms
3. **Recommended Treatments** — General treatment options (home remedies + medical treatments)
4. **When to See a Doctor** — Red flags that require urgent medical attention
5. **Preventive Tips** — Tips to prevent recurrence

Keep each section concise and easy to understand. End with a reminder to consult a doctor.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    res.json({ result: text });
  } catch (err) {
    console.error("Gemini API error:", err.message);
    res.status(500).json({ error: "AI request failed. Please try again." });
  }
});

// ---- POST /api/ask — Ask a Medical Question ----
app.post("/api/ask", async (req, res) => {
  const { question } = req.body;

  if (!question || question.trim() === "") {
    return res.status(400).json({ error: "No question provided." });
  }

  const prompt = `You are a helpful, knowledgeable medical AI assistant. Answer this medical question clearly:

"${question}"

Give a structured, easy-to-understand answer covering: what it is, causes, symptoms if relevant, treatments/management, and when to seek medical help. Always recommend consulting a doctor for personal medical decisions.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ result: text });
  } catch (err) {
    console.error("Gemini API error:", err.message);
    res.status(500).json({ error: "AI request failed. Please try again." });
  }
});

// ---- Fallback: serve index.html ----
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---- Start Server ----
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`✅ Medical AI running at http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless deployment
module.exports = app;
