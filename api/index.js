/**
 * Vercel Serverless Function — Anthropic API proxy met auth + sessieteller
 * Route: /api
 *
 * Vereiste Vercel Environment Variables:
 *   ANTHROPIC_API_KEY     — Anthropic API sleutel
 *   CLERK_SECRET_KEY      — Clerk secret key (sk_live_... of sk_test_...)
 *   SUPABASE_URL          — https://xxxxx.supabase.co
 *   SUPABASE_SERVICE_KEY  — Supabase service_role key
 */

const PLAN_LIMIETEN = {
  gratis:       3,
  starter:      10,
  professional: 40,
  agency:       200,
};

async function verifyClerkToken(token, secretKey) {
  try {
    const res = await fetch("https://api.clerk.com/v1/tokens/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secretKey}`,
      },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.sub || data?.user_id || null;
  } catch { return null; }
}

async function getOfMaakGebruiker(clerkId, email, url, key) {
  const h = {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  };

  const zoek = await fetch(`${url}/rest/v1/gebruikers?clerk_id=eq.${clerkId}&limit=1`, { headers: h });
  const lijst = await zoek.json();

  if (lijst && lijst.length > 0) {
    let u = lijst[0];
    if (u.reset_datum && new Date(u.reset_datum) <= new Date()) {
      const r = await fetch(`${url}/rest/v1/gebruikers?id=eq.${u.id}`, {
        method: "PATCH",
        headers: { ...h, "Prefer": "return=representation" },
        body: JSON.stringify({ sessies_gebruikt: 0, reset_datum: volgendeMaand() }),
      });
      const gereset = await r.json();
      u = gereset[0] || u;
    }
    return u;
  }

  const nieuw = await fetch(`${url}/rest/v1/gebruikers`, {
    method: "POST", headers: h,
    body: JSON.stringify({
      clerk_id: clerkId, email: email || "", naam: "",
      plan: "gratis", sessies_limiet: PLAN_LIMIETEN.gratis,
      sessies_gebruikt: 0, reset_datum: volgendeMaand(),
    }),
  });
  const n = await nieuw.json();
  return n[0] || null;
}

async function logSessie(userId, stap, url, key) {
  const h = { "apikey": key, "Authorization": `Bearer ${key}`, "Content-Type": "application/json" };
  // Verhoog teller
  await fetch(`${url}/rest/v1/gebruikers?id=eq.${userId}`, {
    method: "PATCH", headers: h,
    body: JSON.stringify({ sessies_gebruikt: { increment: 1 } }),
  });
  // Log entry
  await fetch(`${url}/rest/v1/sessies`, {
    method: "POST", headers: h,
    body: JSON.stringify({ gebruiker_id: userId, stap: stap || "api", endpoint: "/api" }),
  });
}

function volgendeMaand() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().split("T")[0];
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key, x-stap, x-user-email");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const anthropicKey = process.env.ANTHROPIC_API_KEY || req.headers["x-api-key"] || "";
  const supabaseUrl  = process.env.SUPABASE_URL || "";
  const supabaseKey  = process.env.SUPABASE_SERVICE_KEY || "";
  const clerkKey     = process.env.CLERK_SECRET_KEY || "";
  const stap         = req.headers["x-stap"] || "api";

  // ── Auth check (alleen als alle keys geconfigureerd zijn) ──
  const token = (req.headers["authorization"] || "").replace("Bearer ", "");
  let gebruiker = null;

  if (clerkKey && supabaseUrl && supabaseKey && token) {
    const clerkId = await verifyClerkToken(token, clerkKey);
    if (!clerkId) {
      return res.status(401).json({
        error: { message: "Ongeldige sessie. Log opnieuw in.", code: "UNAUTHORIZED" }
      });
    }

    gebruiker = await getOfMaakGebruiker(
      clerkId, req.headers["x-user-email"] || "", supabaseUrl, supabaseKey
    );

    if (!gebruiker) {
      return res.status(500).json({ error: { message: "Gebruiker ophalen mislukt." } });
    }

    const limiet = PLAN_LIMIETEN[gebruiker.plan] || PLAN_LIMIETEN.gratis;
    if (gebruiker.sessies_gebruikt >= limiet) {
      return res.status(402).json({
        error: {
          message: `Sessielimiet bereikt (${gebruiker.sessies_gebruikt}/${limiet}). Upgrade je plan om door te gaan.`,
          code: "SESSION_LIMIT",
          plan: gebruiker.plan,
          gebruikt: gebruiker.sessies_gebruikt,
          limiet,
        }
      });
    }

    // Log asynchroon (geen wachttijd voor de gebruiker)
    logSessie(gebruiker.id, stap, supabaseUrl, supabaseKey).catch(console.error);
  }

  // ── Anthropic call ──
  if (!anthropicKey) {
    return res.status(401).json({
      error: { message: "Geen ANTHROPIC_API_KEY ingesteld." }
    });
  }

  try {
    const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body,
    });

    const data = await upstream.json();

    // Sessie-info meegeven aan de frontend
    if (gebruiker) {
      data._sessie = {
        gebruikt: gebruiker.sessies_gebruikt + 1,
        limiet: PLAN_LIMIETEN[gebruiker.plan] || PLAN_LIMIETEN.gratis,
        plan: gebruiker.plan,
      };
    }

    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: "Proxy fout: " + err.message } });
  }
}
