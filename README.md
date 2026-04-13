# Medical AI Assistant 🏥

A smart medical assistant interface built with Node.js, Express, and Google's Gemini API (`gemini-flash-latest`). It allows users to check symptoms or ask general medical questions.

## 📁 Project Structure

```
medical_ai_node/
├── server.js          ← Express backend logic (API key stays safely hidden here)
├── package.json       ← Node.js Dependencies
├── .env               ← Environment variables (Where your API Key goes)
├── vercel.json        ← Vercel Serverless deployment config
└── public/
    ├── index.html     ← Frontend HTML
    ├── css/style.css  ← Styles
    └── js/script.js   ← Frontend logic
```

## ⚙️ How It Works

1. **Frontend (`public/`)**: 
   - A clean UI taking user input. 
   - Instead of querying Google directly (which would expose your API key to everyone), the frontend uses `fetch()` to call our backend at `/api/analyze` and `/api/ask`.
2. **Backend (`server.js`)**: 
   - An Express Server playing the role of a secure middleman.
   - It intercepts the `/api/...` calls, injects your secret `process.env.GEMINI_API_KEY`, structures the prompt, and queries the `@google/generative-ai` SDK.
   - Sifts through the Markdown response and sends it safely back to the client.

## 🚀 Local Setup

1. **Install dependencies**. Open your terminal in this directory and run:
   ```bash
   npm install
   ```
2. **Configure your API Key**. Replace the value in `.env` with a [Free Google AI API Key](https://aistudio.google.com/app/apikey).
   ```env
   GEMINI_API_KEY=your_key_here
   ```
3. **Run the local server**.
   ```bash
   npm start
   ```
4. **Test it!** Open `http://localhost:3000` in your web browser.

