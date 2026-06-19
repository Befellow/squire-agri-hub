// Squire Digital Brain - Gemini API Proxy (Vercel Serverless Function)
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  // Handle CORS preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      error: "GEMINI_API_KEY environment variable not set. Please add it in Vercel Dashboard → Settings → Environment Variables.",
    });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided in request body." });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const optimizedPrompt =
      prompt +
      "\n\nIMPORTANT: Return ONLY a valid, clean raw JSON object string. Do not wrap it in markdown code blocks like ```json ... ```. Start directly with { and end with }.";

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: optimizedPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
        },
      }),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return res.status(geminiRes.status).json({
        error: data.error?.message || JSON.stringify(data),
      });
    }

    // Extract text from response
    let text = "";
    const parts = data?.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.text) text += part.text;
    }

    // Fallback extraction
    if (!text && data?.candidates?.[0]?.content?.text) {
      text = data.candidates[0].content.text;
    }

    // Strip markdown code fences if model added them
    text = text.trim();
    if (text.startsWith("```json")) text = text.slice(7);
    else if (text.startsWith("```")) text = text.slice(3);
    if (text.endsWith("```")) text = text.slice(0, -3);
    text = text.trim();

    if (!text) {
      return res.status(500).json({
        error: "Empty response from Gemini",
        diagnostic: JSON.stringify(data).slice(0, 500),
      });
    }

    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
