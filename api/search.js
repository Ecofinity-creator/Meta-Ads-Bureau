/**
 * Vercel Serverless Function — Anthropic Web Search proxy
 * Route: /api-search
 *
 * Identiek aan /api maar voegt de anthropic-beta header toe
 * zodat Claude de web_search tool kan gebruiken.
 */

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY || req.headers["x-api-key"] || "";

  if (!apiKey) {
    return res.status(401).json({
      error: { message: "Geen API-sleutel. Voeg ANTHROPIC_API_KEY toe als Vercel Environment Variable." },
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
        "anthropic-beta": "web-search-2025-03-05",  // ← web search enabled
      },
      body,
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: "Proxy fout: " + err.message } });
  }
}
