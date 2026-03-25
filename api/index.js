/**
 * Vercel Serverless Function — Anthropic API proxy
 * Route: /api  (alle POST requests vanuit de React app)
 *
 * De ANTHROPIC_API_KEY wordt ingesteld als Environment Variable in Vercel.
 * Lokaal: zet hem in .env.local
 */

export default async function handler(req, res) {
  // CORS headers (voor lokale ontwikkeling)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // API-sleutel: Vercel env var heeft prioriteit, daarna de header van de browser
  const apiKey = process.env.ANTHROPIC_API_KEY || req.headers["x-api-key"] || "";

  if (!apiKey) {
    return res.status(401).json({
      error: {
        message: "Geen API-sleutel. Voeg ANTHROPIC_API_KEY toe als Vercel Environment Variable.",
      },
    });
  }

  try {
    const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body,
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: "Proxy fout: " + err.message } });
  }
}
