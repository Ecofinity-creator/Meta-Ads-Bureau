import { useState, useRef, useEffect } from "react";

const VERDIFY_LOGO = "/verdify-logo.png"; // Uit public/ map

// ─── API KEY CONTEXT ─────────────────────────────────────────────────────────
// Standalone HTML mode: user provides their Anthropic API key once.
// Key is stored in sessionStorage (clears when browser tab closes).

let _apiKey = sessionStorage.getItem("__mab_key") || "";

function getApiKey() { return _apiKey; }
function setApiKey(k) { _apiKey = k.trim(); sessionStorage.setItem("__mab_key", _apiKey); }

// ─── HELPERS ────────────────────────────────────────────────────────────────

function stripJson(str) {
  return str.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
}

// callSearch — routes via /api-search which adds anthropic-beta: web-search-2025-03-05
async function callSearch(system, userPrompt, maxTokens = 1400) {
  const key = getApiKey();
  const headers = { "Content-Type": "application/json" };
  if (key) headers["x-api-key"] = key;

  // Try /api-search first (Vercel serverless with web-search beta header)
  try {
    const resp = await fetch("/api-search", {
      method: "POST", headers,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens, system,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.content && !data.error) {
        return (data.content ?? []).filter(b => b.type === "text").map(b => b.text || "").join("");
      }
    }
  } catch { /* fall through to regular API */ }

  // Fallback: regular API without live search
  return callClaude(
    system + " Gebruik je trainingskennis over dit bedrijf en zijn sector.",
    userPrompt, maxTokens
  );
}


async function callClaude(system, userPrompt, maxTokens = 1000) {
  const key = getApiKey();
  const apiUrl = window.location.protocol === "file:"
    ? "https://api.anthropic.com/v1/messages"
    : "/api";
  const headers = { "Content-Type": "application/json", "anthropic-version": "2023-06-01" };
  if (key) headers["x-api-key"] = key;
  // Stuur Clerk token mee als beschikbaar (gezet door window.__clerkGetToken)
  if (window.__clerkGetToken) {
    try {
      const token = await window.__clerkGetToken();
      if (token) {
        headers["Authorization"] = "Bearer " + token;
        headers["x-user-email"] = window.__clerkUserEmail || "";
      }
    } catch {}
  }
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData?.error?.message || response.statusText;
    // Sessielimiet bereikt
    if (response.status === 402) {
      throw new Error("Sessielimiet bereikt. Upgrade je plan om door te gaan.");
    }
    throw new Error("API fout " + response.status + ": " + errMsg);
  }
  const data = await response.json();
  return data.content?.map((c) => c.text || "").join("") ?? "";
}

function parseJsonSafe(raw, fallback) {
  try { return JSON.parse(stripJson(raw)); }
  catch { return fallback; }
}

function downloadHtml(content, filename) {
  const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><title>${filename}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
  body{font-family:'DM Sans',sans-serif;max-width:960px;margin:40px auto;padding:0 32px;color:#1a1614;line-height:1.8;background:#faf7f2}
  h1{font-family:'Cormorant Garamond',serif;color:#1a1614;border-bottom:2px solid #c9a84c;padding-bottom:14px;font-size:2.4rem;font-weight:700;letter-spacing:-.5px}
  h2{font-family:'Cormorant Garamond',serif;color:#2a2218;margin-top:52px;font-size:1.6rem;font-weight:600}
  .card{background:#fff;border:1px solid #e8e0d0;border-radius:14px;padding:28px;margin:18px 0;box-shadow:0 4px 20px rgba(0,0,0,.06)}
  .badge{display:inline-block;background:#FDF5DC;border:1.5px solid #D4A847;color:#8a6a10;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;margin:4px;letter-spacing:.3px}
  .hook{font-size:10px;background:#1C2333;color:#D4A847;padding:4px 12px;border-radius:6px;display:inline-block;margin-bottom:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase}
  pre{background:#F0EFE9;border:1px solid #e0d5c0;padding:18px;border-radius:10px;white-space:pre-wrap;font-size:12px;word-break:break-word;font-family:'Courier New',monospace;color:#2a2218}
  .concept{font-weight:700;color:#9A7820;font-size:.95rem}
  .why{color:#8a7e6e;font-style:italic;font-size:.88rem;margin:6px 0}
  .opbouw{font-size:.78rem;color:#D4A847;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
</style></head><body>${content}</body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── FALLBACK DATA ───────────────────────────────────────────────────────────

const FALLBACK_SEGMENTEN = [
  { id: 1, naam: "Ambitieuze Ondernemer", leeftijd: "35-44", geslacht: "Man", kenmerken: "Groeigerichte MKB'er, actief op LinkedIn, investeert in tools", performance: "Hoge koopintentie, zoekt ROI-bewijs" },
  { id: 2, naam: "Creatieve Zelfstandige", leeftijd: "28-40", geslacht: "Vrouw", kenmerken: "Freelancer/coach, Instagram-actief, waarde-gedreven", performance: "Engageert op authenticiteit en community" },
  { id: 3, naam: "Scale-up Founder", leeftijd: "30-45", geslacht: "Alle", kenmerken: "Groeit snel, team van 5-20, delegeert marketing", performance: "Reageert op tijdbesparing en schaalbaarheid" },
  { id: 4, naam: "Ervaren Zaakvoerder", leeftijd: "45-55", geslacht: "Man", kenmerken: "Gevestigd bedrijf, ROI-gericht, risicomijdend", performance: "Overtuigd door sociale bewijskracht en garanties" },
];

const FALLBACK_PIJNPUNTEN = [
  "Ik verlies zoveel tijd aan taken die niks opleveren",
  "Mijn omzet groeit niet, ondanks alle moeite die ik doe",
  "Ik weet niet waar ik nieuwe klanten vandaan moet halen",
  "Mijn concurrenten groeien terwijl ik stilsta",
  "Ik werk keihard maar haal het einde van de maand amper",
  "Ik heb geen idee of mijn marketing wel werkt",
  "Iedere keer als ik iets nieuws probeer, kost het geld en levert het niks op",
  "Ik ben altijd bezig maar kom nooit toe aan wat écht belangrijk is",
  "Mijn team doet wat ze willen en ik verlies grip op de business",
  "Ik wil schalen maar weet niet hoe zonder alles zelf te doen",
];

const STAP_NAMEN = ["Bedrijfsinfo", "Doelgroep", "Segmenten & Reviews", "Pijnpunten", "Matrix", "Campagne", "Advertenties", "Meta Setup", "Campagne Evaluatie"];

// ─── STATISCHE HELP-INHOUD PER STAP ─────────────────────────────────────────

const HELP_STATISCH = {
  1: {
    titel: "Wat vul je hier in?",
    secties: [
      {
        icon: "🏢",
        kop: "Bedrijfsnaam",
        tekst: "Vul de officiële naam in zoals je die ook in je advertenties gebruikt. Dit hoeft niet de juridische naam te zijn — de merknaam volstaat."
      },
      {
        icon: "🌐",
        kop: "Website URL",
        tekst: "De landing page waar je bezoekers naartoe stuurt. Zorg dat deze URL werkt en mobiel-vriendelijk is. Optioneel, maar handig voor de AI."
      },
      {
        icon: "📦",
        kop: "Jouw aanbod — zo volledig mogelijk",
        tekst: "Dit is het belangrijkste veld. Beschrijf:\n• Wat je verkoopt (product of dienst)\n• De prijs of prijsrange\n• Je 3 sterkste USP's (wat maakt jou anders?)\n• Voor wie het bedoeld is\n• Wat de klant concreet krijgt\n\nHoe meer detail, hoe beter de AI-output in alle volgende stappen."
      }
    ],
    zoektermen: [
      "USP's bepalen voor mijn bedrijf",
      "value proposition canvas invullen",
      "wat is een goede landingspagina voor Meta Ads"
    ]
  },
  2: {
    titel: "Doelgroepdata ophalen uit Meta",
    secties: [
      {
        icon: "📊",
        kop: "Methode 1 — Export vanuit lopende campagnes (aanbevolen)",
        tekst: "Stap 1: Ga naar business.facebook.com → Advertentiebeheer\nStap 2: Klik bovenaan op 'Campagnes'\nStap 3: Stel de tijdsperiode in op 'Afgelopen 3 maanden' (rechtsboven)\nStap 4: Selecteer alle campagnes (vinkje bovenaan de lijst)\n\n▶ DRAAITABEL AANPASSEN VOOR MAXIMALE DATA:\nStap 5: Klik op 'Kolommen' → 'Kolommen aanpassen'\nStap 6: Voeg deze kolommen toe:\n   • Demografisch: Leeftijd, Geslacht, Locatie, Taal\n   • Gedrag: Apparaat, Plaatsing, Platform\n   • Resultaten: Bereik, Vertoningen, Klikken, CTR, CPC\n   • Conversies: Kosten per resultaat, ROAS, Aankoopwaarde\n   • Doelgroep: Interesses, Gedragingen, Verbindingen\nStap 7: Klik 'Toepassen' om de draaitabel op te slaan\n\nStap 8: Klik op 'Exporteren' → 'Exporteer tabeldata (.csv)'\nStap 9: Upload het gedownloade CSV-bestand hieronder\n\n💡 Hoe meer kolommen je toevoegt, hoe rijker de doelgroepanalyse."
      },
      {
        icon: "👥",
        kop: "Methode 2 — Export vanuit Doelgroepen",
        tekst: "Stap 1: Ga naar business.facebook.com → Ads Manager\nStap 2: Klik op het menu (≡) → 'Doelgroepen'\nStap 3: Selecteer een bestaande doelgroep\nStap 4: Klik op 'Acties' → 'Exporteren'\nStap 5: Kies CSV-formaat en download\n\nGeen bestaande doelgroepen? Gebruik dan de handmatige beschrijving hieronder."
      },
      {
        icon: "👥",
        kop: "Handmatige beschrijving — wat schrijf je?",
        tekst: "Beschrijf je ideale klant zo concreet mogelijk:\n• Leeftijdsbereik\n• Geslacht (of gemengd)\n• Beroep of sector\n• Interesses en gedrag online\n• Locatie (regio, stad, land)\n• Welk probleem ze hebben\n• Wat ze eerder al geprobeerd hebben"
      },
      {
        icon: "💡",
        kop: "Tip: Audience Insights gebruiken",
        tekst: "Via Meta Business Suite → Insights → Doelgroep vind je demografische data over je huidige volgers. Screenshot de belangrijkste cijfers en beschrijf ze handmatig hierboven."
      }
    ],
    zoektermen: [
      "Meta Ads Manager doelgroep exporteren CSV",
      "Facebook Audience Insights gebruiken 2024",
      "custom audience aanmaken Meta Business Suite",
      "Meta lookalike audience aanmaken"
    ]
  },
  3: {
    titel: "Segmenten begrijpen & reviews verzamelen",
    secties: [
      {
        icon: "🗂️",
        kop: "Wat zijn micro-segmenten?",
        tekst: "Eén advertentie voor iedereen werkt niet meer. Micro-segmenten zijn kleine, homogene groepen binnen je doelgroep die elk een eigen boodschap verdienen. De AI maakt er 4 op basis van je data."
      },
      {
        icon: "⭐",
        kop: "Waar vind je klantreviews?",
        tekst: "• Google Bedrijfsprofiel → Reviews kopiëren\n• Facebook pagina → Aanbevelingen\n• Trustpilot of Capterra (indien aanwezig)\n• Emails van tevreden klanten\n• DM's of berichten op sociale media\n• Directe reacties na een aankoop\n\nKopieer gewoon de ruwe tekst — de AI filtert de relevante pijnpunten eruit."
      },
      {
        icon: "✏️",
        kop: "JSON aanpassen",
        tekst: "Via de 'JSON aanpassen' knop kan je de segmenten handmatig verfijnen. Pas namen, leeftijden of omschrijvingen aan zodat ze perfect aansluiten bij jouw kennis van je klanten."
      }
    ],
    zoektermen: [
      "Google reviews exporteren als tekst",
      "klantreviews verzamelen voor marketing",
      "persona's maken voor Facebook advertenties",
      "voice of customer onderzoek doen"
    ]
  },
  4: {
    titel: "De juiste pijnpunten kiezen",
    secties: [
      {
        icon: "🎯",
        kop: "Waarom pijnpunten zo krachtig zijn",
        tekst: "Meta Ads die inspelen op een erkend probleem scoren gemiddeld 3x hoger dan 'positieve' advertenties. De beste pijnpunten zijn zinnen die je klant zichzelf hoort denken — herkenbaar, specifiek en emotioneel geladen."
      },
      {
        icon: "✅",
        kop: "Hoe kies je de beste 6?",
        tekst: "Kies pijnpunten die:\n• Het meest voorkomen bij je klanten\n• Direct verband houden met jouw oplossing\n• Emotioneel resoneren (frustratie, angst, schaamte of hoop)\n• Variëren in toon (rationeel én emotioneel)\n\nVermijd te brede pijnpunten zoals 'gebrek aan tijd' — die passen bij iedereen en vallen niet op."
      },
      {
        icon: "🔢",
        kop: "Maximum van 6",
        tekst: "Je kiest maximaal 6 pijnpunten omdat je in stap 5 een matrix bouwt van segmenten × pijnpunten. Met meer dan 6 wordt het aantal combinaties onbeheersbaar."
      }
    ],
    zoektermen: [
      "pijnpunten klanten marketing advertenties",
      "emotionele triggers in Facebook advertenties",
      "jobs to be done framework marketing",
      "copywriting pijnpunt naar oplossing structuur"
    ]
  },
  5: {
    titel: "De matrix invullen",
    secties: [
      {
        icon: "🔢",
        kop: "Wat is de segment × pijnpunt matrix?",
        tekst: "Elke cel in de tabel stelt een unieke combinatie voor: een specifiek segment met een specifiek pijnpunt. Elke geselecteerde combinatie wordt later een aparte advertentievariant met eigen teksten en visuals."
      },
      {
        icon: "🎯",
        kop: "Welke combinaties selecteer je?",
        tekst: "Selecteer combinaties waar:\n• Het pijnpunt echt relevant is voor dat segment\n• Je oplossing een duidelijk antwoord geeft\n• De doelgroep groot genoeg is om te adverteren\n\nNiet elk pijnpunt werkt voor elk segment. Een 'tijdspijnpunt' werkt beter bij drukke founders dan bij gepensioneerde ondernemers."
      },
      {
        icon: "📐",
        kop: "Minimum van 4 combinaties",
        tekst: "Je hebt minstens 4 combinaties nodig om een degelijke A/B-teststructuur op te zetten. Met 6 combinaties heb je genoeg materiaal voor een volledige campagne met meerdere advertentiesets."
      }
    ],
    zoektermen: [
      "Meta Ads advertentieset structuur A/B testen",
      "Facebook campagne structuur best practices 2024",
      "Meta Ads segmentatie per doelgroep instellen",
      "advertentievarianten testen Facebook"
    ]
  },
  6: {
    titel: "De juiste campagne-insteek",
    secties: [
      {
        icon: "🚀",
        kop: "Welke formule werkt wanneer?",
        tekst: "• Gratis Webinar/Demo → werkt voor complexe of dure producten\n• E-book/PDF → ideaal om e-mailadressen te verzamelen\n• Online Challenge → hoge betrokkenheid, community-gevoel\n• Quiz-funnel → perfect voor segmentatie en personalisatie\n• Directe Verkoop → alleen bij lage prijs of sterk merk\n• Gratis Consult → B2B en dienstverleners\n• Winactie → snel bereik, lagere kwaliteit leads\n• Brochure → traditionele sectoren en offline beslissers"
      },
      {
        icon: "💡",
        kop: "Eigen idee invullen",
        tekst: "Heb je een specifieke actie gepland (bv. 'Kom naar onze open deur' of 'Gratis proefperiode van 14 dagen')? Vul dat dan in het tekstveld in — de AI past alle teksten hierop aan."
      },
      {
        icon: "⚠️",
        kop: "Let op: stap 6 gaat niet automatisch verder",
        tekst: "Je moet expliciet een keuze maken én op de knop klikken. Dit is bewust: de campagne-insteek bepaalt de toon van alle 10 advertentieteksten per combinatie."
      }
    ],
    zoektermen: [
      "beste lead magnet ideeën Facebook advertenties",
      "Meta Ads conversiecampagne vs leadcampagne",
      "gratis webinar promoten op Facebook",
      "B2B leadgeneratie strategie Meta Ads"
    ]
  },
  7: {
    titel: "Advertentieteksten & prompts begrijpen",
    secties: [
      {
        icon: "✍️",
        kop: "De 5 hook-types",
        tekst: "• Emotioneel: raakt een gevoel of frustratie\n• Rationeel: feiten, cijfers en logica overtuigen\n• Direct probleem: 'Ken je dat gevoel dat…'\n• Urgentie: 'Nieuw:', 'Let op:', 'Tijdelijk:'\n• Droom: het gewenste resultaat als startpunt\n\nElk type werkt voor een ander persoonlijkheidstype. Samen dekken ze je hele doelgroep."
      },
      {
        icon: "🖼️",
        kop: "Foto-prompts — direct openen",
        tekst: "Kopieer de Engelse prompt en plak in een van deze tools:",
        links: [
          { label: "Midjourney (Discord)", url: "https://www.midjourney.com" },
          { label: "DALL-E via ChatGPT", url: "https://chatgpt.com" },
          { label: "Adobe Firefly", url: "https://firefly.adobe.com" },
          { label: "Leonardo.ai", url: "https://leonardo.ai" },
          { label: "Ideogram", url: "https://ideogram.ai" },
        ]
      },
      {
        icon: "🎬",
        kop: "Video-prompts — direct openen",
        tekst: "Kopieer de Engelse prompt (hook → body → CTA) en gebruik:",
        links: [
          { label: "Sora (OpenAI)", url: "https://sora.com" },
          { label: "Runway Gen-3", url: "https://runwayml.com" },
          { label: "Pika Labs", url: "https://pika.art" },
          { label: "Kling AI", url: "https://klingai.com" },
          { label: "Veo 3 (Google Labs)", url: "https://labs.google" },
        ]
      }
    ],
    zoektermen: [
      "Midjourney beginners handleiding 2024",
      "DALL-E advertentiebeelden maken",
      "Runway Gen-3 video advertentie maken",
      "Meta Ads afbeeldingsspecificaties formaten",
      "Facebook advertentietekst tekenlimiet primary text"
    ]
  }
};

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────

const C = {
  // Navy & Gold theme
  goud:        "#D4A847",
  goudLight:   "#FDF5DC",
  goudBright:  "#E8C060",
  goudDim:     "#9A7820",
  bg:          "#F0EFE9",
  bgMid:       "#E6E3D8",
  card:        "#FFFFFF",
  border:      "#D4D0C4",
  borderGold:  "#C4922A",
  text:        "#1C2333",
  textSoft:    "#2E3D58",
  muted:       "#8A95A8",
  success:     "#4ade80",
  error:       "#f87171",
  info:        "#60a5fa",
  shadow:      "0 4px 28px rgba(28,35,51,.10)",
  shadowGold:  "0 4px 20px rgba(212,168,71,.25)",
  drawerBg:    "#F5F2EA",
  navy:        "#1C2333",
  navyMid:     "#2E3D58",
  navyLight:   "#3D5278",
};

const font = {
  display: "'Cormorant Garamond', 'Georgia', serif",
  body:    "'DM Sans', 'Segoe UI', sans-serif",
};

// ─── HELP DRAWER ─────────────────────────────────────────────────────────────

function HelpDrawer({ stap, bedrijf, open, onClose }) {
  const [aiTips, setAiTips] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiGeladen, setAiGeladen] = useState(false);
  const [gekopieerd, setGekopieerd] = useState(null);
  const drawerRef = useRef();

  const statisch = HELP_STATISCH[stap] || {};
  const heeftNaam = bedrijf?.naam?.trim().length > 0;

  // Sluit bij klik buiten drawer
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  // Reset AI-tips als stap verandert
  useEffect(() => {
    setAiTips(null);
    setAiGeladen(false);
  }, [stap]);

  const genereerAiTips = async () => {
    if (!heeftNaam || aiGeladen) return;
    setLoadingAi(true);
    try {
      const raw = await callClaude(
        "Je bent een Meta Ads expert coach. Geef output ALLEEN als JSON object, geen uitleg.",
        `Genereer gepersonaliseerde helptips voor "${bedrijf.naam}" (aanbod: "${bedrijf.aanbod || "onbekend"}") voor stap ${stap} van een Meta Ads campagne-tool.
Stap ${stap} heet "${STAP_NAMEN[stap - 1]}".

JSON output:
{
  "tips": [
    {"titel": "korte tip titel", "tekst": "concrete tip specifiek voor dit bedrijf, max 2 zinnen"}
  ],
  "zoektermen_specifiek": ["zoekterm 1 specifiek voor dit bedrijf of sector", "zoekterm 2", "zoekterm 3"]
}

Geef 3 tips en 3 sector-specifieke zoektermen. Wees concreet en gebruik de bedrijfsnaam en sector.`,
        600
      );
      const parsed = parseJsonSafe(raw, null);
      if (parsed && parsed.tips) setAiTips(parsed);
    } catch { /* stil falen */ }
    finally { setLoadingAi(false); setAiGeladen(true); }
  };

  const kopieer = async (tekst, id) => {
    try {
      await navigator.clipboard.writeText(tekst);
      setGekopieerd(id);
      setTimeout(() => setGekopieerd(null), 1800);
    } catch { /* stil falen */ }
  };

  const zoekGoogle = (term) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(term)}`;
    window.open(url, "_blank", "noopener");
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
        zIndex: 200, backdropFilter: "blur(2px)",
        animation: "fadeIn .2s ease",
      }} />

      {/* Drawer */}
      <div ref={drawerRef} style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: 440, maxWidth: "92vw",
        background: C.drawerBg,
        borderLeft: `1px solid ${C.borderGold}`,
        zIndex: 201, overflowY: "auto",
        boxShadow: "-8px 0 40px rgba(0,0,0,.7)",
        animation: "slideIn .25s cubic-bezier(.4,0,.2,1)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: `1px solid ${C.border}`,
          background: C.bgMid,
          position: "sticky", top: 0, zIndex: 1,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.goud}, ${C.goudBright})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, color: "#1a1614", fontWeight: 800,
              }}>?</div>
              <div>
                <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 17, color: C.text, lineHeight: 1 }}>
                  Hulp — Stap {stap}
                </div>
                <div style={{ fontSize: 11, color: C.goudDim, letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 3 }}>
                  {STAP_NAMEN[stap - 1]}
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "transparent", border: `1px solid ${C.border}`,
            borderRadius: 8, color: C.muted, cursor: "pointer",
            width: 32, height: 32, fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .15s",
          }}
            onMouseEnter={e => { e.target.style.borderColor = C.goud; e.target.style.color = C.goud; }}
            onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.muted; }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "22px 24px", flex: 1 }}>

          {/* ── Statische secties ── */}
          {statisch.titel && (
            <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 20, color: C.text, marginBottom: 18, letterSpacing: "-.3px" }}>
              {statisch.titel}
            </div>
          )}

          {(statisch.secties ?? []).map((s, i) => (
            <div key={i} style={{
              background: C.card, borderRadius: 12, padding: 18,
              border: `1px solid ${C.border}`, marginBottom: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 13, color: C.goud, letterSpacing: ".2px" }}>
                  {s.kop}
                </span>
              </div>
              <div style={{ fontFamily: font.body, fontSize: 13, color: C.textSoft, lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: s.links ? 10 : 0 }}>
                {s.tekst}
              </div>
              {s.links && (
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {s.links.map((lnk, li) => (
                    <a key={li} href={lnk.url} target="_blank" rel="noopener"
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 7, background: C.goudLight, border: `1px solid ${C.borderGold}`, color: C.goud, fontFamily: font.body, fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#e8d88a22"}
                      onMouseLeave={e => e.currentTarget.style.background = C.goudLight}
                    >
                      <span style={{ fontSize: 14 }}>↗</span> {lnk.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* ── Statische zoektermen ── */}
          {(statisch.zoektermen ?? []).length > 0 && (
            <div style={{ marginTop: 20, marginBottom: 24 }}>
              <div style={{
                fontFamily: font.body, fontWeight: 700, fontSize: 11,
                color: C.muted, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 12,
              }}>
                🔍 Zoektermen om zelf op te zoeken
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {statisch.zoektermen.map((z, i) => (
                  <ZoekTermRij key={i} term={z} id={`s-${i}`} gekopieerd={gekopieerd} onKopieer={kopieer} onZoek={zoekGoogle} />
                ))}
              </div>
            </div>
          )}

          {/* ── Scheidingslijn ── */}
          {heeftNaam && (
            <div style={{
              borderTop: `1px solid ${C.borderGold}`,
              margin: "4px 0 20px",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                background: C.drawerBg, padding: "0 12px",
                fontFamily: font.body, fontSize: 11, color: C.goud,
                fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase",
              }}>
                ✦ Persoonlijk voor {bedrijf.naam}
              </div>
            </div>
          )}

          {/* ── AI-tips sectie ── */}
          {heeftNaam && !aiGeladen && (
            <div style={{ marginBottom: 20 }}>
              <button
                onClick={genereerAiTips}
                disabled={loadingAi}
                style={{
                  width: "100%", padding: "13px 20px",
                  background: loadingAi ? C.goudLight : `linear-gradient(135deg, ${C.goud}, ${C.goudBright})`,
                  border: `1px solid ${loadingAi ? C.borderGold : "transparent"}`,
                  borderRadius: 10, cursor: loadingAi ? "default" : "pointer",
                  fontFamily: font.body, fontWeight: 700, fontSize: 13,
                  color: loadingAi ? C.goud : "#1a1614",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all .2s",
                }}
              >
                {loadingAi ? (
                  <>
                    <span style={{
                      width: 14, height: 14,
                      border: `2px solid ${C.borderGold}`, borderTop: `2px solid ${C.goud}`,
                      borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block",
                    }} />
                    Persoonlijke tips genereren…
                  </>
                ) : (
                  <>✨ Genereer tips op maat voor {bedrijf.naam}</>
                )}
              </button>
              <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 8, fontFamily: font.body }}>
                De AI analyseert jouw aanbod en geeft specifiek advies voor deze stap.
              </div>
            </div>
          )}

          {aiTips && (
            <>
              <div style={{ marginBottom: 12 }}>
                {(aiTips.tips ?? []).map((t, i) => (
                  <div key={i} style={{
                    background: "#f0f8f0",
                    border: `1px solid ${C.borderGold}`,
                    borderRadius: 12, padding: 16, marginBottom: 10,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: `linear-gradient(135deg, ${C.goud}, ${C.goudBright})`,
                        flexShrink: 0,
                      }} />
                      <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 13, color: C.goudBright }}>
                        {t.titel ?? ""}
                      </span>
                    </div>
                    <div style={{ fontFamily: font.body, fontSize: 13, color: C.textSoft, lineHeight: 1.65, paddingLeft: 13 }}>
                      {t.tekst ?? ""}
                    </div>
                  </div>
                ))}
              </div>

              {(aiTips.zoektermen_specifiek ?? []).length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{
                    fontFamily: font.body, fontWeight: 700, fontSize: 11,
                    color: C.muted, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10,
                  }}>
                    🔍 Specifieke zoektermen voor jouw sector
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {(aiTips.zoektermen_specifiek ?? []).map((z, i) => (
                      <ZoekTermRij key={i} term={z} id={`ai-${i}`} gekopieerd={gekopieerd} onKopieer={kopieer} onZoek={zoekGoogle} />
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => { setAiTips(null); setAiGeladen(false); }} style={{
                background: "transparent", border: "none", color: C.muted,
                fontFamily: font.body, fontSize: 12, cursor: "pointer",
                marginTop: 8, textDecoration: "underline",
              }}>
                ↻ Opnieuw genereren
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 24px",
          borderTop: `1px solid ${C.border}`,
          background: C.bgMid,
          fontSize: 11, color: C.muted, fontFamily: font.body,
          textAlign: "center",
        }}>
          Klik buiten dit paneel of op × om te sluiten
        </div>
      </div>
    </>
  );
}

function ZoekTermRij({ term, id, gekopieerd, onKopieer, onZoek }) {
  const isGekop = gekopieerd === id;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: C.card, borderRadius: 8,
      border: `1px solid ${C.border}`, overflow: "hidden",
    }}>
      <div style={{ flex: 1, padding: "9px 12px", fontFamily: font.body, fontSize: 12, color: C.textSoft }}>
        {term}
      </div>
      <button
        onClick={() => onKopieer(term, id)}
        title="Kopieer zoekterm"
        style={{
          background: "transparent", border: "none", borderLeft: `1px solid ${C.border}`,
          color: isGekop ? C.success : C.muted, cursor: "pointer",
          padding: "9px 10px", fontSize: 14, transition: "all .15s",
          flexShrink: 0,
        }}
      >
        {isGekop ? "✓" : "⎘"}
      </button>
      <button
        onClick={() => onZoek(term)}
        title="Zoek op Google"
        style={{
          background: "transparent", border: "none", borderLeft: `1px solid ${C.border}`,
          color: C.goudDim, cursor: "pointer",
          padding: "9px 10px", fontSize: 13, transition: "all .15s",
          flexShrink: 0,
        }}
        onMouseEnter={e => e.target.style.color = C.goud}
        onMouseLeave={e => e.target.style.color = C.goudDim}
      >
        ↗
      </button>
    </div>
  );
}

// ─── HELP BUTTON ─────────────────────────────────────────────────────────────

function HelpBtn({ onClick, heeftNaam }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Hulp bij deze stap"
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: hover ? C.goudLight : "transparent",
        border: `1.5px solid ${hover ? C.goud : C.borderGold}`,
        borderRadius: 20, padding: "6px 14px",
        cursor: "pointer", transition: "all .18s",
        fontFamily: font.body, fontWeight: 600, fontSize: 12,
        color: hover ? C.navyMid : C.goudDim,
        letterSpacing: ".3px",
      }}
    >
      <span style={{
        width: 18, height: 18, borderRadius: "50%",
        background: `linear-gradient(135deg, ${C.goud}, ${C.goudBright})`,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, color: "#1a1614", fontWeight: 800, flexShrink: 0,
      }}>?</span>
      Hulp
      {heeftNaam && (
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: C.goud, marginLeft: 2,
          boxShadow: `0 0 6px ${C.goud}`,
        }} />
      )}
    </button>
  );
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function ProgressBar({ stap }) {
  return (
    <div style={{ padding: "32px 0 20px", userSelect: "none" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {STAP_NAMEN.map((naam, i) => {
          const n = i + 1;
          const done = stap > n;
          const active = stap === n;
          return (
            <div key={n} style={{ display: "flex", alignItems: "center" }}>
              <div title={naam} style={{
                width: 40, height: 40, borderRadius: "50%",
                background: done ? `linear-gradient(135deg, ${C.goud}, ${C.goudBright})` : active ? C.goudLight : "transparent",
                border: `2px solid ${done || active ? C.goud : "#D4D0C4"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: font.display, fontWeight: 700, fontSize: 15,
                color: done ? C.navy : active ? C.goud : C.muted,
                transition: "all .35s",
                boxShadow: active ? C.shadowGold : done ? "0 0 16px rgba(201,168,76,.3)" : "none",
              }}>
                {done ? "✓" : n}
              </div>
              {i < 8 && (
                <div style={{
                  width: 28, height: 2,
                  background: done ? `linear-gradient(90deg, ${C.goud}, ${C.goudBright})` : C.border,
                  transition: "background .35s",
                }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 14, fontFamily: font.body, fontSize: 11, fontWeight: 600, color: C.goudDim, letterSpacing: "2px", textTransform: "uppercase" }}>
        Stap {stap} van {STAP_NAMEN.length} &nbsp;·&nbsp; {STAP_NAMEN[stap - 1]}
      </div>
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: "32px 36px", boxShadow: "0 2px 20px rgba(28,35,51,.07)", ...style }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, disabled, variant = "primary", style = {}, small = false }) {
  const base = {
    border: "none", borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: font.body, fontWeight: 600, fontSize: small ? 13 : 14,
    padding: small ? "8px 18px" : "13px 26px",
    transition: "all .2s", opacity: disabled ? .35 : 1,
    display: "inline-flex", alignItems: "center", gap: 7, letterSpacing: ".2px", ...style,
  };
  const variants = {
    primary: { background: disabled ? C.border : `linear-gradient(135deg, ${C.goud} 0%, ${C.goudBright} 100%)`, color: disabled ? C.muted : "#1C2333", fontWeight: 700, boxShadow: disabled ? "none" : C.shadowGold },
    outline: { background: "transparent", color: C.goud, border: `1.5px solid ${C.goud}` },
    ghost: { background: C.goudLight, color: C.goudDim, border: `1px solid ${C.borderGold}` },
    navy: { background: "#1C2333", color: "#F0EFE9", fontWeight: 700, border: "none" },
    danger: { background: "rgba(248,113,113,.1)", color: C.error, border: `1px solid rgba(248,113,113,.3)` },
  };
  return <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>{children}</button>;
}

function Input({ label, value, onChange, placeholder, type = "text", style = {} }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {label && <label style={{ display: "block", fontFamily: font.body, fontWeight: 600, fontSize: 11, color: C.goudDim, marginBottom: 8, letterSpacing: "1.5px", textTransform: "uppercase" }}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", boxSizing: "border-box", padding: "13px 18px", borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: font.body, fontSize: 14, background: C.bgMid, color: C.text, outline: "none", transition: "border .2s, box-shadow .2s", ...style }}
        onFocus={e => { e.target.style.borderColor = C.goud; e.target.style.boxShadow = C.shadowGold; }}
        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 5, style = {} }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {label && <label style={{ display: "block", fontFamily: font.body, fontWeight: 600, fontSize: 11, color: C.goudDim, marginBottom: 8, letterSpacing: "1.5px", textTransform: "uppercase" }}>{label}</label>}
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ width: "100%", boxSizing: "border-box", padding: "13px 18px", borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: font.body, fontSize: 14, background: C.bgMid, color: C.text, outline: "none", resize: "vertical", lineHeight: 1.65, ...style }}
        onFocus={e => { e.target.style.borderColor = C.goud; e.target.style.boxShadow = C.shadowGold; }}
        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function Badge({ children, style = {} }) {
  return (
    <span style={{ display: "inline-block", background: C.goudLight, border: `1px solid ${C.borderGold}`, color: C.goud, padding: "4px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: font.body, margin: "3px 4px 3px 0", letterSpacing: ".3px", ...style }}>
      {children}
    </span>
  );
}

function SectionHeader({ title, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 10, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
      <h3 style={{ fontFamily: font.display, fontWeight: 600, fontSize: 20, color: C.navy, margin: 0, letterSpacing: "-.3px" }}>{title}</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

function Loader({ text = "Genereren…" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.goud, fontFamily: font.body, fontSize: 13, fontWeight: 600 }}>
      <span style={{ display: "inline-block", width: 16, height: 16, border: `2px solid ${C.borderGold}`, borderTop: `2px solid ${C.goud}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      {text}
    </div>
  );
}

function StepTitle({ emoji, title, sub, onHelp, heeftNaam }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 26 }}>{emoji}</span>
          <h2 style={{ fontFamily: font.display, fontWeight: 700, fontSize: 26, margin: 0, color: C.navy, letterSpacing: "-.5px", lineHeight: 1.1 }}>{title}</h2>
        </div>
        {onHelp && <HelpBtn onClick={onHelp} heeftNaam={heeftNaam} />}
      </div>
      {sub && <p style={{ color: C.muted, fontSize: 14, margin: 0, fontFamily: font.body, paddingLeft: 38 }}>{sub}</p>}
    </div>
  );
}

// ─── STAP 1 ─────────────────────────────────────────────────────────────────

// callClaudeWithSearch: uses the standard Claude API (no beta headers that
// cause CORS issues in standalone HTML files). Claude uses its training knowledge
// + sector reasoning to generate USPs and aanbod text based on name/URL/sector.
async function callClaudeWithSearch(system, userPrompt, maxTokens = 1400) {
  return callClaude(system, userPrompt, maxTokens);
}

function UspSuggester({ naam, url, onInsert }) {
  const [usps, setUsps] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gegenereerd, setGegenereerd] = useState(false);
  const [bronnen, setBronnen] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [nieuweUsp, setNieuweUsp] = useState("");
  const [uspFout, setUspFout] = useState("");

  const genereer = async () => {
    setLoading(true); setGegenereerd(true); setUspFout("");
    try {
      const sectorHint = (naam + " " + url).toLowerCase();
      const sector = sectorHint.includes("eco") || sectorHint.includes("green") || sectorHint.includes("finity") || sectorHint.includes("duurzaam") || sectorHint.includes("energy") ? "duurzaamheid en energie"
        : sectorHint.includes("tech") || sectorHint.includes("soft") || sectorHint.includes("app") || sectorHint.includes("dev") || sectorHint.includes("ify") || sectorHint.includes("digit") ? "software en technologie"
        : sectorHint.includes("bouw") || sectorHint.includes("construct") ? "bouw en infrastructuur"
        : sectorHint.includes("consult") || sectorHint.includes("advies") ? "consultancy"
        : "professionele dienstverlening";
      const sysprompt = "Je bent een marketing expert. Geef output ALLEEN als JSON object, geen uitleg, geen markdown blokken.";
      const userprompt = "Genereer 6 sterke USPs voor " + naam + (url ? " (" + url + ")" : "") + " in de sector " + sector + ". Hoe communiceert dit type bedrijf op LinkedIn en Facebook? Verwerk die inzichten in de USPs. Geef output als JSON object met: sector (string), samenvatting (string, 2 zinnen), usps (array van exact 6 strings elk max 10 woorden), bronnen (lege array).";
      const _key = getApiKey();
      const _hdrs = { "Content-Type": "application/json", "anthropic-version": "2023-06-01" };
      if (_key) _hdrs["x-api-key"] = _key;
      const resp = await fetch("/api", { method: "POST", headers: _hdrs, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: sysprompt, messages: [{ role: "user", content: userprompt }] }) });
      const data = await resp.json();
      const raw = (data.content || []).map(c => c.text || "").join("");
      const parsed = parseJsonSafe(raw, null);
      if (parsed && Array.isArray(parsed.usps) && parsed.usps.length > 0) {
        setUsps(parsed.usps.map(t => ({ tekst: t, geselecteerd: true })));
        setBronnen(parsed.bronnen ?? []);
        if (parsed.samenvatting) setUspSamenvatting(parsed.samenvatting);
        if (parsed.sector) setUspSector(parsed.sector);
      } else {
        setUsps([]);
        setUspFout("Geen USP's ontvangen. Probeer opnieuw. (raw: " + (raw ? raw.substring(0, 80) : "leeg") + ")");
      }
    } catch (e) {
      setUspFout("Fout: " + (e.message || "onbekend"));
      setUsps([]);
    } finally {
      setLoading(false);
    }
  };

  // Local state for sector/samenvatting display
  const [uspSamenvatting, setUspSamenvatting] = useState("");
  const [uspSector, setUspSector] = useState("");

  const toggleUsp = (i) => {
    setUsps(usps.map((u, idx) => idx === i ? { ...u, geselecteerd: !u.geselecteerd } : u));
  };

  const startEdit = (i) => {
    setEditIdx(i);
    setEditVal(usps[i].tekst);
  };

  const saveEdit = (i) => {
    if (editVal.trim()) {
      setUsps(usps.map((u, idx) => idx === i ? { ...u, tekst: editVal.trim() } : u));
    }
    setEditIdx(null);
    setEditVal("");
  };

  const verwijder = (i) => {
    setUsps(usps.filter((_, idx) => idx !== i));
  };

  const voegNieuweUspToe = () => {
    if (nieuweUsp.trim()) {
      setUsps([...usps, { tekst: nieuweUsp.trim(), geselecteerd: true }]);
      setNieuweUsp("");
    }
  };

  const geselectedUsps = (usps ?? []).filter(u => u.geselecteerd).map(u => u.tekst);

  const voegToeAanAanbod = () => {
    if (geselectedUsps.length === 0) return;
    const blok = geselectedUsps.map(u => `• ${u}`).join("\n");
    onInsert(blok);
  };

  if (!naam.trim()) return null;

  return (
    <div style={{
      background: "#edf7ed",
      border: `1px solid #a8d4a8`,
      borderRadius: 14,
      padding: "20px 22px",
      marginBottom: 20,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: gegenereerd ? 16 : 0, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #2d7a3a, #4ade80)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15,
          }}>🔍</div>
          <div>
            <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 16, color: C.text }}>
              USP's opzoeken voor {naam}
            </div>
            <div style={{ fontSize: 11, color: "#4ade80", fontWeight: 600, letterSpacing: ".5px" }}>
              AI zoekt online en stelt unieke voordelen voor
            </div>
          </div>
        </div>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4ade80", fontSize: 13, fontWeight: 600 }}>
            <span style={{ width: 14, height: 14, border: "2px solid #1a4a22", borderTop: "2px solid #4ade80", borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block" }} />
            Online opzoeken…
          </div>
        ) : (
          <button onClick={genereer} style={{
            background: gegenereerd ? "transparent" : "linear-gradient(135deg, #2d7a3a, #3d9e4a)",
            border: `1.5px solid ${gegenereerd ? "#2a4a2e" : "transparent"}`,
            borderRadius: 9, padding: "8px 16px",
            color: gegenereerd ? "#4ade80" : "#fff",
            fontFamily: font.body, fontWeight: 700, fontSize: 12,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            letterSpacing: ".3px",
          }}>
            {gegenereerd ? "↻ Opnieuw opzoeken" : "🔍 Zoek USP's op"}
          </button>
        )}
      </div>

      {/* Samenvatting */}
      {uspSamenvatting && (
        <div style={{
          background: "rgba(74,222,128,.06)", border: "1px solid #2a4a2e",
          borderRadius: 10, padding: "10px 14px", marginBottom: 16,
          fontSize: 13, color: C.textSoft, lineHeight: 1.6,
        }}>
          <span style={{ color: "#4ade80", fontWeight: 700, fontSize: 11, letterSpacing: "1px", textTransform: "uppercase" }}>
            {uspSector && `${uspSector} · `}Gevonden online
          </span>
          <div style={{ marginTop: 4 }}>{uspSamenvatting}</div>
          {bronnen.length > 0 && (
            <div style={{ marginTop: 6, fontSize: 11, color: C.muted }}>
              Bronnen: {bronnen.slice(0,2).map((b, i) => (
                <span key={i} style={{ marginRight: 8, color: "#4ade80", opacity: .7 }}>
                  {b.replace(/https?:\/\/(www\.)?/, "").substring(0, 40)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* USP lijst */}
      {usps && usps.length > 0 && (
        <>
          <div style={{ fontFamily: font.body, fontWeight: 600, fontSize: 11, color: "#4ade80", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10 }}>
            Selecteer & bewerk — {geselectedUsps.length} geselecteerd
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {usps.map((u, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: u.geselecteerd ? "rgba(74,222,128,.08)" : "rgba(255,255,255,.03)",
                border: `1.5px solid ${u.geselecteerd ? "#2d6b35" : "#1e2e20"}`,
                borderRadius: 10, padding: "8px 12px",
                transition: "all .15s",
              }}>
                {/* Checkbox */}
                <div onClick={() => toggleUsp(i)} style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                  border: `1.5px solid ${u.geselecteerd ? "#4ade80" : "#2a4a2e"}`,
                  background: u.geselecteerd ? "#4ade80" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#111a12", fontWeight: 800, fontSize: 12,
                }}>
                  {u.geselecteerd ? "✓" : ""}
                </div>

                {/* Tekst of edit veld */}
                {editIdx === i ? (
                  <input
                    autoFocus
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveEdit(i); if (e.key === "Escape") setEditIdx(null); }}
                    style={{
                      flex: 1, background: "#f0f8f0", border: "1.5px solid #4ade80",
                      borderRadius: 6, padding: "4px 10px", color: C.text,
                      fontFamily: font.body, fontSize: 13, outline: "none",
                    }}
                  />
                ) : (
                  <span style={{
                    flex: 1, fontFamily: font.body, fontSize: 13,
                    color: u.geselecteerd ? C.textSoft : C.muted,
                    fontStyle: u.geselecteerd ? "normal" : "italic",
                  }}>
                    {u.tekst}
                  </span>
                )}

                {/* Acties */}
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {editIdx === i ? (
                    <button onClick={() => saveEdit(i)} style={{
                      background: "#4ade80", border: "none", borderRadius: 6,
                      color: "#111a12", cursor: "pointer", padding: "3px 9px",
                      fontSize: 12, fontWeight: 700,
                    }}>✓ Ok</button>
                  ) : (
                    <button onClick={() => startEdit(i)} style={{
                      background: "transparent", border: "1px solid #2a4a2e",
                      borderRadius: 6, color: C.muted, cursor: "pointer",
                      padding: "3px 8px", fontSize: 12, transition: "all .15s",
                    }}
                      onMouseEnter={e => { e.target.style.borderColor="#4ade80"; e.target.style.color="#4ade80"; }}
                      onMouseLeave={e => { e.target.style.borderColor="#2a4a2e"; e.target.style.color=C.muted; }}
                    >✎</button>
                  )}
                  <button onClick={() => verwijder(i)} style={{
                    background: "transparent", border: "1px solid #2a4a2e",
                    borderRadius: 6, color: C.muted, cursor: "pointer",
                    padding: "3px 8px", fontSize: 12, transition: "all .15s",
                  }}
                    onMouseEnter={e => { e.target.style.borderColor=C.error; e.target.style.color=C.error; }}
                    onMouseLeave={e => { e.target.style.borderColor="#2a4a2e"; e.target.style.color=C.muted; }}
                  >✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Nieuwe USP toevoegen */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input
              value={nieuweUsp}
              onChange={e => setNieuweUsp(e.target.value)}
              onKeyDown={e => e.key === "Enter" && voegNieuweUspToe()}
              placeholder="+ Eigen USP toevoegen…"
              style={{
                flex: 1, background: C.bgMid, border: `1px solid #2a4a2e`,
                borderRadius: 9, padding: "8px 14px", color: C.text,
                fontFamily: font.body, fontSize: 13, outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = "#4ade80"}
              onBlur={e => e.target.style.borderColor = "#2a4a2e"}
            />
            <button onClick={voegNieuweUspToe} disabled={!nieuweUsp.trim()} style={{
              background: nieuweUsp.trim() ? "linear-gradient(135deg,#2d7a3a,#3d9e4a)" : C.border,
              border: "none", borderRadius: 9, padding: "8px 16px",
              color: nieuweUsp.trim() ? "#fff" : C.muted,
              fontFamily: font.body, fontWeight: 700, fontSize: 13,
              cursor: nieuweUsp.trim() ? "pointer" : "not-allowed",
            }}>+ Toevoegen</button>
          </div>

          {/* Invoegen knop */}
          <button
            onClick={voegToeAanAanbod}
            disabled={geselectedUsps.length === 0}
            style={{
              width: "100%", padding: "11px 20px",
              background: geselectedUsps.length > 0
                ? "linear-gradient(135deg, #2d7a3a, #4ade80)"
                : C.border,
              border: "none", borderRadius: 10,
              color: geselectedUsps.length > 0 ? "#111a12" : C.muted,
              fontFamily: font.body, fontWeight: 700, fontSize: 14,
              cursor: geselectedUsps.length > 0 ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            ↓ Voeg {geselectedUsps.length} geselecteerde USP{geselectedUsps.length !== 1 ? "'s" : ""} in het aanbodveld
          </button>
        </>
      )}

      {usps && usps.length === 0 && !loading && (
        <div style={{ color: C.muted, fontSize: 13, fontStyle: "italic", marginTop: 8 }}>
          {uspFout || "Geen USP's gevonden. Probeer opnieuw of vul je aanbod handmatig in."}
        </div>
      )}
      {!usps && uspFout && !loading && (
        <div style={{ color: C.error, fontSize: 13, marginTop: 8 }}>{uspFout}</div>
      )}
    </div>
  );
}

function AanbodSuggester({ naam, url, onInsert }) {
  const [resultaat, setResultaat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gegenereerd, setGegenereerd] = useState(false);
  const [editVal, setEditVal] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [aanbodFout, setAanbodFout] = useState("");

  const genereer = async () => {
    setLoading(true); setGegenereerd(true);
    try {
      const sectorHint = (naam + " " + url).toLowerCase();
      const sector = sectorHint.includes("eco") || sectorHint.includes("green") || sectorHint.includes("finity") || sectorHint.includes("duurzaam") || sectorHint.includes("energy") ? "duurzaamheid en energie"
        : sectorHint.includes("tech") || sectorHint.includes("soft") || sectorHint.includes("app") || sectorHint.includes("dev") || sectorHint.includes("ify") || sectorHint.includes("digit") ? "software en technologie"
        : sectorHint.includes("bouw") || sectorHint.includes("construct") ? "bouw en infrastructuur"
        : sectorHint.includes("consult") || sectorHint.includes("advies") ? "consultancy"
        : "professionele dienstverlening";
      const sysprompt = "Je bent een marketing expert. Geef output ALLEEN als JSON, geen uitleg.";
      const userprompt = "Schrijf aanbodprofiel voor " + naam + (url ? " (" + url + ")" : "") + " in sector " + sector + ". Hoe communiceert dit type bedrijf op sociale media? Verwerk die toon in de aanbodtekst. Output: JSON met diensten, prijs, doelgroep, positionering, aanbod_tekst (5-7 zinnen voor Meta Ads), bronnen (leeg array).";
      const _key2 = getApiKey();
      const _url2 = window.location.protocol === "file:" ? "https://api.anthropic.com/v1/messages" : "/api";
      const _hdrs2 = { "Content-Type": "application/json", "anthropic-version": "2023-06-01" };
      if (_key2) _hdrs2["x-api-key"] = _key2;
      const resp = await fetch(_url2, {
        method: "POST",
        headers: _hdrs2,
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, system: sysprompt, messages: [{ role: "user", content: userprompt }] }),
      });
      const data = await resp.json();
      const raw = (data.content || []).map(c => c.text || "").join("");
      setAanbodFout("");
      const parsed = parseJsonSafe(raw, null);
      if (parsed && parsed.aanbod_tekst) {
        setResultaat(parsed);
        setEditVal(parsed.aanbod_tekst);
      } else {
        console.warn("Aanbod raw:", raw ? raw.substring(0,200) : "(leeg)");
        setResultaat(null);
        if (!raw) setAanbodFout("Geen resultaten van de API. Controleer je API-sleutel of probeer opnieuw.");
        else setAanbodFout("Kon geen aanbodinfo opmaken uit de zoekresultaten. Probeer opnieuw.");
      }
    } catch (e) {
      console.error("Aanbod search error:", e);
      setAanbodFout("Verbindingsfout: " + (e.message || "onbekende fout"));
      setResultaat(null);
    }
    finally { setLoading(false); }
  };

  if (!naam.trim()) return null;

  return (
    <div style={{
      background: "#edf2fc",
      border: "1px solid #a0b8e0",
      borderRadius: 14,
      padding: "20px 22px",
      marginBottom: 8,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: resultaat ? 16 : 0, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #1e4a8a, #60a5fa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15,
          }}>🌐</div>
          <div>
            <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 16, color: C.text }}>
              Aanbod opzoeken voor {naam}
            </div>
            <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 600, letterSpacing: ".5px" }}>
              AI zoekt online en stelt een aanbodtekst voor
            </div>
          </div>
        </div>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#60a5fa", fontSize: 13, fontWeight: 600 }}>
            <span style={{ width: 14, height: 14, border: "2px solid #1e3050", borderTop: "2px solid #60a5fa", borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block" }} />
            Aanbod opzoeken…
          </div>
        ) : (
          <button onClick={genereer} style={{
            background: gegenereerd ? "transparent" : "linear-gradient(135deg, #1e4a8a, #2563eb)",
            border: `1.5px solid ${gegenereerd ? "#1e3050" : "transparent"}`,
            borderRadius: 9, padding: "8px 16px",
            color: gegenereerd ? "#60a5fa" : "#fff",
            fontFamily: font.body, fontWeight: 700, fontSize: 12,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}>
            {gegenereerd ? "↻ Opnieuw opzoeken" : "🌐 Zoek aanbod op"}
          </button>
        )}
      </div>

      {resultaat && (
        <>
          {/* Opgesplitste info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "📦 Diensten/Producten", val: resultaat.diensten },
              { label: "💶 Prijs", val: resultaat.prijs },
              { label: "👤 Doelgroep", val: resultaat.doelgroep },
              { label: "🎯 Positionering", val: resultaat.positionering },
            ].map((r, i) => (
              <div key={i} style={{
                background: "rgba(96,165,250,.05)", border: "1px solid #1e3050",
                borderRadius: 10, padding: "10px 12px",
              }}>
                <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, letterSpacing: ".5px", marginBottom: 5, textTransform: "uppercase" }}>
                  {r.label}
                </div>
                <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.55 }}>
                  {r.val || <span style={{ color: C.muted, fontStyle: "italic" }}>Niet gevonden</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Bronnen */}
          {(resultaat.bronnen ?? []).length > 0 && (
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>
              Bronnen: {(resultaat.bronnen ?? []).slice(0, 2).map((b, i) => (
                <span key={i} style={{ marginRight: 10, color: "#60a5fa", opacity: .7 }}>
                  {b.replace(/https?:\/\/(www\.)?/, "").substring(0, 45)}
                </span>
              ))}
            </div>
          )}

          {/* Aanbodtekst — bewerkbaar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
                ✍️ Gegenereerde aanbodtekst — aanpasbaar
              </div>
              <button onClick={() => setEditMode(!editMode)} style={{
                background: "transparent", border: `1px solid #1e3050`,
                borderRadius: 7, padding: "3px 10px", color: "#60a5fa",
                fontSize: 12, cursor: "pointer", fontFamily: font.body, fontWeight: 600,
              }}
                onMouseEnter={e => e.target.style.borderColor="#60a5fa"}
                onMouseLeave={e => e.target.style.borderColor="#1e3050"}
              >
                {editMode ? "👁 Voorbeeld" : "✎ Bewerken"}
              </button>
            </div>

            {editMode ? (
              <textarea
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                rows={6}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "#f0f4fc", border: "1.5px solid #60a5fa",
                  borderRadius: 10, padding: "12px 14px",
                  color: C.text, fontFamily: font.body, fontSize: 13,
                  lineHeight: 1.65, resize: "vertical", outline: "none",
                }}
              />
            ) : (
              <div style={{
                background: "rgba(96,165,250,.05)", border: "1px solid #1e3050",
                borderRadius: 10, padding: "12px 14px",
                fontSize: 13, color: C.textSoft, lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}>
                {editVal}
              </div>
            )}
          </div>

          {/* Invoegen knop */}
          <button
            onClick={() => onInsert(editVal)}
            disabled={!editVal.trim()}
            style={{
              width: "100%", padding: "11px 20px",
              background: editVal.trim()
                ? "linear-gradient(135deg, #1e4a8a, #60a5fa)"
                : C.border,
              border: "none", borderRadius: 10,
              color: editVal.trim() ? "#fff" : C.muted,
              fontFamily: font.body, fontWeight: 700, fontSize: 14,
              cursor: editVal.trim() ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            ↓ Gebruik deze aanbodtekst
          </button>
        </>
      )}

      {gegenereerd && !resultaat && !loading && (
        <div style={{ color: aanbodFout ? C.error : C.muted, fontSize: 13, fontStyle: "italic", marginTop: 8 }}>
          {aanbodFout || "Geen aanbodinfo gevonden online. Vul het aanbodveld handmatig in."}
        </div>
      )}
    </div>
  );
}

function Stap1({ data, setData, onNext, onHelp }) {
  const insertUsps = (blok) => {
    const huidig = data.aanbod.trim();
    setData({ ...data, aanbod: huidig ? huidig + "\n\nUSP's:\n" + blok : "USP's:\n" + blok });
  };

  const insertAanbod = (tekst) => {
    setData({ ...data, aanbod: tekst });
  };

  return (
    <Card>
      <StepTitle emoji="🏢" title="Vertel ons over je bedrijf"
        sub="We gebruiken deze info doorheen de volledige campagne-opbouw."
        onHelp={onHelp} heeftNaam={false} />
      <Input label="Bedrijfsnaam *" value={data.naam} onChange={v => setData({ ...data, naam: v })} placeholder="bv. GrowthLab BV" />
      <Input label="Website URL" value={data.url} onChange={v => setData({ ...data, url: v })} placeholder="bv. https://growthlab.be" />

      {/* Aanbod Suggester — blauw */}
      <AanbodSuggester naam={data.naam} url={data.url} onInsert={insertAanbod} />

      {/* USP Suggester — groen */}
      <UspSuggester naam={data.naam} url={data.url} onInsert={insertUsps} />

      <Textarea label="Jouw aanbod *" value={data.aanbod} onChange={v => setData({ ...data, aanbod: v })}
        placeholder="Beschrijf je product of dienst, de prijs, USP's en je doelgroep…&#10;&#10;Gebruik de knoppen hierboven om automatisch een aanbodtekst en USP's op te zoeken." rows={7} />
      <Btn onClick={onNext} disabled={!data.naam.trim() || !data.aanbod.trim()}>Bevestigen & verder →</Btn>
    </Card>
  );
}

// ─── STAP 2 ─────────────────────────────────────────────────────────────────

function Stap2({ bedrijf, onCsvData, onNext, onHelp }) {
  const [csvText, setCsvText] = useState("");
  const [handmatig, setHandmatig] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => { setCsvText(ev.target.result); if (onCsvData) onCsvData(ev.target.result); };
    r.readAsText(f);
  };

  const analyseer = async () => {
    setLoading(true);
    try {
      const d = csvText || handmatig || "(geen data)";
      const raw = await callClaude(
        "Je bent expert Meta Ads strateeg. Geef output ALLEEN als JSON array, geen uitleg.",
        `Analyseer data voor "${bedrijf.naam}" met aanbod "${bedrijf.aanbod}". Data: ${d}.\nMaak 4 micro-segmenten.\nJSON: [{"id":1,"naam":"...","leeftijd":"35-44","geslacht":"Vrouw","kenmerken":"...","performance":"..."}]`
      );
      const parsed = parseJsonSafe(raw, FALLBACK_SEGMENTEN);
      onNext(Array.isArray(parsed) ? parsed : FALLBACK_SEGMENTEN);
    } catch { onNext(FALLBACK_SEGMENTEN); }
    finally { setLoading(false); }
  };

  return (
    <Card>
      <StepTitle emoji="🎯" title="Doelgroepanalyse"
        sub="Upload klantdata (CSV) of beschrijf je doelgroep handmatig."
        onHelp={onHelp} heeftNaam={!!bedrijf.naam} />
      <div style={{ marginBottom: 24 }}>
        <input type="file" accept=".csv,.txt" ref={fileRef} onChange={handleFile} style={{ display: "none" }} />
        <Btn variant="outline" onClick={() => fileRef.current.click()} small>📁 CSV uploaden</Btn>
        {csvText && <span style={{ marginLeft: 14, fontSize: 13, color: C.success, fontWeight: 600 }}>✓ Geladen ({csvText.length} tekens)</span>}
      </div>
      <Textarea label="Of beschrijf je doelgroep handmatig" value={handmatig} onChange={setHandmatig}
        placeholder="bv. Zaakvoerders van KMO's in Vlaanderen, 35-55 jaar…" rows={5} />
      {loading ? <Loader text="Doelgroep analyseren…" /> : <Btn onClick={analyseer}>Analyseer doelgroep →</Btn>}
    </Card>
  );
}

// ─── STAP 3 ─────────────────────────────────────────────────────────────────

function SegmentKaart({ seg }) {
  return (
    <div style={{ background: C.bgMid, borderRadius: 14, padding: 22, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 10 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#D4A847"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(212,168,71,.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18, color: C.text }}>{seg.naam}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Badge>{seg.leeftijd}</Badge><Badge>{seg.geslacht}</Badge>
      </div>
      <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.6 }}>{seg.kenmerken}</div>
      <div style={{ fontSize: 12, color: C.goud, fontWeight: 600, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>⚡ {seg.performance}</div>
    </div>
  );
}

function Stap3({ bedrijf, segmenten, setSegmenten, onNext, onHelp }) {
  const [reviews, setReviews] = useState("");
  const [zoekData, setZoekData] = useState("");
  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonEdit, setJsonEdit] = useState(JSON.stringify(segmenten, null, 2));
  const [jsonErr, setJsonErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [reviewStappen, setReviewStappen] = useState([]);
  const [concStappen, setConcStappen] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingConc, setLoadingConc] = useState(false);
  const [concOpen, setConcOpen] = useState(false);

  // Detecteer sector automatisch uit aanbod
  const detecteerSector = (aanbod) => {
    const a = (aanbod || "").toLowerCase();
    if (a.includes("zonnepaneel") || a.includes("warmtepomp") || a.includes("energie") || a.includes("batterij") || a.includes("solar") || a.includes("ecofinity"))
      return "installateurs zonnepanelen, warmtepompen en thuisbatterijen";
    if (a.includes("bouw") || a.includes("renovatie") || a.includes("aannemer") || a.includes("construct"))
      return "aannemers en renovatiebedrijven";
    if (a.includes("boekhouder") || a.includes("accountant") || a.includes("boekhouding"))
      return "boekhouders en accountantskantoren voor KMO's";
    if (a.includes("marketing") || a.includes("reclame") || a.includes("campagne") || a.includes("ads"))
      return "marketingbureaus en reclameagentschappen";
    if (a.includes("coach") || a.includes("coaching") || a.includes("training") || a.includes("cursus"))
      return "business coaches en trainers";
    if (a.includes("fitness") || a.includes("afslan") || a.includes("sport") || a.includes("gym") || a.includes("be-fit") || a.includes("befit"))
      return "fitness- en afslankstudio's";
    if (a.includes("kapper") || a.includes("haar") || a.includes("salon") || a.includes("beauty") || a.includes("schoonheid"))
      return "kappers en beautysalons";
    if (a.includes("it ") || a.includes("software") || a.includes("app") || a.includes("website") || a.includes("tech"))
      return "IT-bedrijven en softwareontwikkelaars";
    if (a.includes("restaurant") || a.includes("horeca") || a.includes("catering"))
      return "restaurants en horecazaken";
    // Generieke fallback: haal 3-5 kernwoorden uit naam en aanbod
    const kernwoorden = (bedrijf.naam + " " + (bedrijf.aanbod || "")).replace(/\b(bv|nv|bvba|de|het|een|van|voor|met)\b/gi, "").trim().substring(0, 40);
    return kernwoorden + " sector";
  };

  const [concCategorie, setConcCategorie] = useState(() => detecteerSector(bedrijf.aanbod));

  const addStap = (setter, tekst, status = "bezig") =>
    setter(prev => [...prev, { tekst, status, id: Date.now() + Math.random() }]);
  const updateLast = (setter, status, tekst) =>
    setter(prev => prev.map((s, i) =>
      i === prev.length - 1 ? { ...s, status, ...(tekst ? { tekst } : {}) } : s
    ));

  const applyJson = () => {
    try { setSegmenten(JSON.parse(jsonEdit)); setJsonErr(""); setJsonOpen(false); }
    catch (e) { setJsonErr("Ongeldige JSON: " + e.message); }
  };

  // ── Reviews ophalen — gefaseerde aanpak ──
  const zoekReviews = async () => {
    setLoadingReviews(true);
    setReviewStappen([]);
    const gevondenReviews = [];

    // Helper: is dit een echte review of meta-commentaar?
    const isEchtReview = (r) => {
      if (!r || r.length < 15 || r.length > 600) return false;
      // Reject meta-commentaar
      const reject = /^(ik heb|ik kan|helaas|jammer|geen |niet |op basis|de zoek|echter|om echte|het spijt|dit zijn|hier zijn|zoekresult|samenvatting|conclusie|algemene|opmerking|noot|let op|disclaimer|reviewtekst|klantreview|beoordelingen|aanbeveling|toegankelijk|individuele|exacte|daadwerkelijk|letterlijk|beschikbaar|zichtbaar|verschijn|directe toegang|specifieke review|pagina van)/i;
      return !reject.test(r.trim());
    };

    try {
      // ── FASE 1: Zoek review-snippets via Google Search ──
      addStap(setReviewStappen, "Zoek reviews voor " + bedrijf.naam + " via Google…");
      const fase1Prompt = "Zoek naar: " + bedrijf.naam + " reviews"
        + (bedrijf.url ? " " + bedrijf.url.replace("https://","").replace("http://","").split("/")[0] : "")
        + ". Zoek ook naar: " + bedrijf.naam + " ervaringen klanten"
        + ". Lees de zoekresultaten en kopieer elke reviewtekst die je tegenkomt."
        + " Dit zijn korte stukjes tekst zoals: 'Zeer professioneel bedrijf, ik ben zeer tevreden'"
        + " of '5 sterren, geweldige service'."
        + " Geef ALLEEN de reviewteksten. Start meteen met de eerste review. Geen inleiding.";
      const raw1 = await callSearch(
        "Kopieer reviewteksten letterlijk uit de zoekresultaten. Geen uitleg. Geen commentaar. Direct beginnen met de reviews.",
        fase1Prompt, 800
      );
      if (raw1) {
        const sep = String.fromCharCode(10);
        raw1.split(sep).map(r => r.trim()).filter(isEchtReview).forEach(r => gevondenReviews.push(r));
        setZoekData(prev => (prev ? prev + "\n\n" : "") + "ZOEKRESULTATEN:\n" + raw1.trim());
      }
      updateLast(setReviewStappen, gevondenReviews.length > 0 ? "klaar" : "leeg",
        gevondenReviews.length > 0 ? gevondenReviews.length + " reviews gevonden via Google ✓" : "Geen reviews in zoekresultaten");

      // ── FASE 2: Zoek op review-aggregator sites ──
      addStap(setReviewStappen, "Zoek op Trustpilot, Houzz en reviewsites…");
      const fase2Prompt = "Zoek op Trustpilot, Yelp, Houzz, Capterra of andere reviewsites naar ervaringen over "
        + bedrijf.naam
        + (bedrijf.aanbod ? " (" + bedrijf.aanbod.substring(0,60) + ")" : "")
        + ". Als je niets vindt voor dit exacte bedrijf, zoek dan naar de meest recente reviews van vergelijkbare bedrijven in hun sector."
        + " Geef de reviewteksten direct, zonder inleiding.";
      const raw2 = await callSearch(
        "Zoek reviewteksten op reviewsites. Kopieer ze letterlijk. Geen uitleg.",
        fase2Prompt, 600
      );
      if (raw2) {
        const sep = String.fromCharCode(10);
        raw2.split(sep).map(r => r.trim()).filter(isEchtReview).forEach(r => {
          if (!gevondenReviews.includes(r)) gevondenReviews.push(r);
        });
        setZoekData(prev => (prev ? prev + "\n\n" : "") + "REVIEWSITES:\n" + raw2.trim());
      }
      updateLast(setReviewStappen, "klaar",
        gevondenReviews.length > 2 ? "Totaal " + gevondenReviews.length + " reviews verzameld ✓" : "Fase 2 voltooid");

      // ── RESULTAAT ──
      if (gevondenReviews.length > 0) {
        const sep = String.fromCharCode(10);
        setReviews(gevondenReviews.slice(0, 12).join(sep));
        addStap(setReviewStappen, gevondenReviews.length + " reviews opgeslagen ✓", "klaar");
      } else {
        addStap(setReviewStappen, "Geen reviews gevonden via web search. Plak ze handmatig hieronder.", "leeg");
      }

    } catch(e) {
      const msg = e.message || "";
      updateLast(setReviewStappen, "fout",
        msg.includes("429") ? "Rate limit — wacht 30 sec. en probeer opnieuw" : "Fout: " + msg.substring(0, 100)
      );
    }
    setLoadingReviews(false);
  };


  // ── Concurrenten ophalen — 1 call ──
  const zoekConcurrenten = async () => {
    if (!concCategorie.trim()) return;
    setLoadingConc(true);
    setConcStappen([]);
    const cat = concCategorie.trim();
    try {
      addStap(setConcStappen, "Zoek concurrenten en pijnpunten in: " + cat + "…");
      const prompt = "Geef een marktanalyse voor " + cat + " in Belgie en Nederland."
        + " Context: we analyseren voor " + bedrijf.naam
        + (bedrijf.aanbod ? " (" + bedrijf.aanbod.substring(0, 80) + ")" : "") + "."
        + " 1) De 3 bekendste concurrenten (naam + 1 zin omschrijving)"
        + " 2) Per concurrent: 3 typische klachten van klanten als ik-citaten in het Nederlands."
        + " Schrijf als genummerde lijst. Wees specifiek.";
      const raw = await callClaude(
        "Je bent marktexpert met kennis van de Belgische en Nederlandse markt. Geef concrete marktinformatie.",
        prompt, 800
      );
      if (!raw || raw.trim().length < 30) {
        updateLast(setConcStappen, "leeg", "Geen resultaat — probeer een specifiekere categorie");
        setLoadingConc(false); return;
      }
      const sep = String.fromCharCode(10);
      const namenRegels = raw.split(sep).filter(r => /^[1-3][.)]\s/.test(r.trim()));
      const namen = namenRegels
        .map(r => r.trim().replace(/^[1-3][.)]\s*[*]{0,2}/, "").split(/[:\-–—(]/)[0].trim())
        .filter(n => n.length > 2 && n.length < 50).slice(0, 3);
      updateLast(setConcStappen, "klaar", namen.length > 0 ? "Gevonden: " + namen.join(", ") : "Concurrenten geanalyseerd ✓");
      addStap(setConcStappen, "Pijnpunten in kaart gebracht ✓", "klaar");
      setZoekData(prev => (prev ? prev + "\n\n" : "") + "CONCURRENTEN & PIJNPUNTEN in " + cat + ":\n" + raw.trim());
    } catch(e) {
      const msg = e.message || "";
      updateLast(setConcStappen, msg.includes("429") ? "Rate limit — wacht 30 sec. en probeer opnieuw" : "Fout: " + msg.substring(0, 80), "fout");
    }
    setLoadingConc(false);
  };

  // ── Pijnpunten analyseren ──
  const analyseer = async () => {
    setLoading(true);
    try {
      const aanbodCtx = bedrijf.aanbod ? bedrijf.aanbod.substring(0, 250) : "";
      const alleData = [reviews, zoekData].filter(t => t && t.trim().length > 5).join("\n\n").substring(0, 1200);
      const sysprompt = "Je bent een ervaren Meta Ads copywriter. Geef ALLEEN een genummerde lijst van exact 10 pijnpunten. Geen inleiding, geen uitleg. Alleen de 10 genummerde regels.";
      const prompt = "Bedrijf: " + bedrijf.naam
        + (aanbodCtx ? ". Verkoopt: " + aanbodCtx : "")
        + (alleData ? ". Context:\n" + alleData : "")
        + "\n\nGenereer 10 SPECIFIEKE pijnpunten voor de klanten van dit bedrijf."
        + " Elke pijnpunt: ik-zin, max 12 woorden, direct over het product of de sector."
        + "\n\n1.";
      const raw = await callClaude(sysprompt, prompt, 700);
      const rawMet1 = "1." + (raw || "");
      const sep2 = String.fromCharCode(10);
      const pijnpunten = rawMet1.split(sep2)
        .map(r => r.replace(/^[0-9]+[.)]\s*/, "").replace(/^[-*]\s*/, "").trim())
        .filter(r => r.length > 8 && r.length < 120);
      if (pijnpunten.length >= 5) { onNext(pijnpunten.slice(0, 10)); return; }
      const raw2 = await callClaude(
        "Geef een genummerde lijst van 10 pijnpunten. Alleen de lijst.",
        "10 klantpijnpunten als ik-zinnen (max 12 woorden) voor " + (aanbodCtx || bedrijf.naam) + ".\n1.",
        500
      );
      const p2 = ("1." + (raw2 || "")).split(sep2).map(r => r.replace(/^[0-9]+[.)]\s*/, "").trim()).filter(r => r.length > 8 && r.length < 120);
      if (p2.length >= 3) { onNext(p2.slice(0, 10)); return; }
      const s = aanbodCtx.toLowerCase();
      if (s.includes("zonnepaneel") || s.includes("warmtepomp") || s.includes("energie") || s.includes("batterij")) {
        onNext(["Mijn energiefactuur blijft stijgen ondanks mijn panelen","Ik weet niet of mijn installatie optimaal presteert","De terugverdientijd van mijn investering is onduidelijk","Ik mis een duidelijk overzicht van mijn energieopbrengst","Mijn installateur is onbereikbaar als er iets misgaat","Ik betaal nog te veel aan het net terwijl ik panelen heb","De subsidies zijn zo ingewikkeld dat ik het opgegeven heb","Ik twijfel of een thuisbatterij de investering waard is","Na de installatie hoor ik niets meer van mijn leverancier","Ik weet niet wie ik kan vertrouwen voor eerlijk advies"]);
      } else if (s.includes("bouw") || s.includes("renovatie")) {
        onNext(["Mijn verbouwing loopt al maanden vertraging op","Ik weet nooit wat de eindfactuur zal zijn","Aannemers komen hun afspraken niet na","Ik vind geen betrouwbare vakman","Na de werken zijn er altijd nog problemen","De communicatie met mijn aannemer is rampzalig","Ik begrijp de offertes niet en betaal te veel","Mijn project staat stil zonder uitleg","Ik durf niemand aan te spreken op slechte kwaliteit","Elke aannemer geeft een compleet andere prijs"]);
      } else { onNext(FALLBACK_PIJNPUNTEN); }
    } catch(e) { console.error("Analyseer:", e); onNext(FALLBACK_PIJNPUNTEN); }
    finally { setLoading(false); }
  };

  const renderStappen = (stappen, kleur) => stappen.length === 0 ? null : (
    <div style={{ background: kleur + "12", border: "1px solid " + kleur + "40", borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
      {stappen.map((s, i) => (
        <div key={s.id || i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "3px 0", fontSize: 13, fontFamily: font.body }}>
          <span style={{ flexShrink: 0 }}>{s.status === "klaar" ? "✅" : s.status === "leeg" ? "⬜" : s.status === "fout" ? "❌" : "⏳"}</span>
          <span style={{ color: s.status === "klaar" ? "#1a6b1a" : s.status === "fout" ? "#cc2200" : C.textSoft }}>{s.tekst}</span>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <StepTitle emoji="👥" title="Jouw 4 micro-segmenten"
        sub="AI heeft deze segmenten gegenereerd. Voeg reviews toe en analyseer pijnpunten."
        onHelp={onHelp} heeftNaam={!!bedrijf.naam} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        {segmenten.map(s => <SegmentKaart key={s.id} seg={s} />)}
      </div>

      <div style={{ marginBottom: 20 }}>
        <Btn variant="ghost" onClick={() => setJsonOpen(!jsonOpen)} small>
          {jsonOpen ? "▲ JSON verbergen" : "▼ JSON aanpassen"}
        </Btn>
        {jsonOpen && (
          <div style={{ marginTop: 10 }}>
            <textarea value={jsonEdit} onChange={e => setJsonEdit(e.target.value)} rows={8}
              style={{ width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 10, border: "1px solid " + (jsonErr ? C.error : C.border), fontFamily: "monospace", fontSize: 12, background: "#f9f6ef", color: "#2a1f0a", resize: "vertical" }} />
            {jsonErr && <div style={{ color: C.error, fontSize: 12, marginTop: 4 }}>{jsonErr}</div>}
            <Btn onClick={applyJson} small style={{ marginTop: 8 }}>Toepassen</Btn>
          </div>
        )}
      </div>

      {/* Reviews knop */}
      <div style={{ marginBottom: 6 }}>
        <button onClick={zoekReviews} disabled={loadingReviews || loadingConc} style={{
          background: loadingReviews ? C.bgMid : "linear-gradient(135deg,#2d7a3a,#4ade80)",
          border: "none", borderRadius: 9, padding: "10px 20px",
          color: loadingReviews ? C.muted : "#111", fontFamily: font.body, fontWeight: 700, fontSize: 13,
          cursor: (loadingReviews || loadingConc) ? "not-allowed" : "pointer",
          display: "inline-flex", alignItems: "center", gap: 7,
        }}>
          {loadingReviews
            ? <><span style={{ width:13,height:13,border:"2px solid #aaa",borderTop:"2px solid #2d7a3a",borderRadius:"50%",animation:"spin 1s linear infinite",display:"inline-block" }}/> Reviews zoeken…</>
            : "⭐ Reviews & ervaringen ophalen"}
        </button>
      </div>
      {/* Voortgang reviews — altijd zichtbaar onder de knop */}
      {reviewStappen.length > 0 && renderStappen(reviewStappen, "#2d7a3a")}

      {/* Concurrenten knop */}
      <div style={{ marginBottom: 6 }}>
        {!concOpen ? (
          <button onClick={() => setConcOpen(true)} disabled={loadingReviews || loadingConc} style={{
            background: "linear-gradient(135deg,#1e4a8a,#60a5fa)",
            border: "none", borderRadius: 9, padding: "10px 20px", color: "#fff",
            fontFamily: font.body, fontWeight: 700, fontSize: 13,
            cursor: (loadingReviews || loadingConc) ? "not-allowed" : "pointer",
            display: "inline-flex", alignItems: "center", gap: 7,
          }}>🏆 Pijnpunten concurrenten ophalen</button>
        ) : (
          <div style={{ background: "#edf2fc", border: "1px solid #a0b8e0", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 13, color: "#1e4a8a", marginBottom: 4 }}>
              🎯 In welke categorie zoeken we concurrenten?
            </div>
            <div style={{ fontSize: 12, color: C.muted, fontFamily: font.body, marginBottom: 10 }}>
              Gebaseerd op jouw sector — pas aan indien nodig
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                value={concCategorie}
                onChange={e => setConcCategorie(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !loadingConc && concCategorie.trim().length > 3) zoekConcurrenten(); }}
                placeholder="Bv: installateurs zonnepanelen en warmtepompen"
                style={{ flex: 1, minWidth: 220, padding: "9px 14px", borderRadius: 8, border: "1.5px solid #60a5fa", fontFamily: font.body, fontSize: 14, background: "#fff", outline: "none" }}
                autoFocus
              />
              <button onClick={zoekConcurrenten} disabled={loadingConc || concCategorie.trim().length < 3}
                style={{
                  background: (!loadingConc && concCategorie.trim().length >= 3) ? "linear-gradient(135deg,#1e4a8a,#60a5fa)" : "#ccc",
                  border: "none", borderRadius: 8, padding: "9px 20px", color: "#fff",
                  fontFamily: font.body, fontWeight: 700, fontSize: 13,
                  cursor: (!loadingConc && concCategorie.trim().length >= 3) ? "pointer" : "not-allowed",
                  display: "inline-flex", alignItems: "center", gap: 7,
                }}>
                {loadingConc
                  ? <><span style={{ width:13,height:13,border:"2px solid rgba(255,255,255,0.4)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 1s linear infinite",display:"inline-block" }}/> Zoeken…</>
                  : "🔍 Zoek concurrenten →"}
              </button>
              {!loadingConc && (
                <button onClick={() => { setConcOpen(false); setConcStappen([]); }}
                  style={{ background: "transparent", border: "1px solid #a0b8e0", borderRadius: 8, padding: "9px 12px", color: C.muted, fontSize: 12, cursor: "pointer", fontFamily: font.body }}>✕</button>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Voortgang concurrenten */}
      {concStappen.length > 0 && renderStappen(concStappen, "#1e4a8a")}

      <Textarea
        label="Klantreviews of feedback (optioneel)"
        value={reviews}
        onChange={setReviews}
        placeholder="Gevonden reviews verschijnen hier — of plak zelf tekst. AI destilleert de pijnpunten."
        rows={5}
      />
      {zoekData && (
        <div style={{ fontSize: 11, color: C.muted, fontFamily: font.body, marginBottom: 8, marginTop: -6 }}>
          ℹ️ Zoekresultaten van reviews en concurrenten worden meegenomen in de analyse.
        </div>
      )}
      {loading
        ? <Loader text="Pijnpunten analyseren op basis van jouw sector en reviews…" />
        : <Btn onClick={analyseer}>Analyseer pijnpunten →</Btn>
      }
    </Card>
  );
}

// ─── STAP 4 ─────────────────────────────────────────────────────────────────

function Stap4({ pijnpunten, gekozen, setGekozen, onNext, bedrijf, onHelp }) {
  const toggle = (i) => {
    if (gekozen.includes(i)) setGekozen(gekozen.filter(x => x !== i));
    else if (gekozen.length < 6) setGekozen([...gekozen, i]);
  };
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <StepTitle emoji="🎯" title="Selecteer pijnpunten" sub="Kies maximaal 6 pijnpunten voor je campagne." onHelp={onHelp} heeftNaam={!!bedrijf?.naam} />
        <div style={{ background: C.goudLight, border: `1.5px solid ${C.borderGold}`, borderRadius: 10, padding: "10px 20px", fontFamily: font.body, fontWeight: 700, fontSize: 15, color: C.goud, whiteSpace: "nowrap" }}>
          {gekozen.length} / 6
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {pijnpunten.map((p, i) => {
          const sel = gekozen.includes(i);
          return (
            <div key={i} onClick={() => toggle(i)} style={{ padding: "14px 20px", borderRadius: 12, cursor: "pointer", border: `1.5px solid ${sel ? C.goud : C.border}`, background: sel ? C.goudLight : C.bgMid, display: "flex", alignItems: "center", gap: 14, transition: "all .18s", boxShadow: sel ? C.shadowGold : "none" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `1.5px solid ${sel ? C.goud : C.border}`, background: sel ? `linear-gradient(135deg, ${C.goud}, ${C.goudBright})` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a1614", fontWeight: 800, fontSize: 13 }}>
                {sel ? "✓" : ""}
              </div>
              <span style={{ fontFamily: font.body, fontSize: 14, color: sel ? C.goudBright : C.textSoft, fontStyle: "italic" }}>"{p}"</span>
            </div>
          );
        })}
      </div>
      <Btn onClick={onNext} disabled={gekozen.length < 2}>Matrix bouwen → ({gekozen.length} gekozen)</Btn>
    </Card>
  );
}

// ─── STAP 5 ─────────────────────────────────────────────────────────────────

function Stap5({ segmenten, pijnpunten, gekozenPijnpunten, combinaties, setCombinaties, onNext, bedrijf, onHelp }) {
  const toggle = (key) => {
    if (combinaties.includes(key)) setCombinaties(combinaties.filter(k => k !== key));
    else if (combinaties.length < 6) setCombinaties([...combinaties, key]);
  };
  const afkorten = (s, n = 26) => s.length > n ? s.substring(0, n) + "…" : s;
  const gekozenLabels = combinaties.map(k => {
    const [sId, pIdx] = k.split("_");
    const seg = segmenten.find(s => String(s.id) === sId);
    const pp = pijnpunten[parseInt(pIdx)];
    return seg && pp ? `${seg.naam} × "${pp.substring(0, 38)}…"` : k;
  });

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <StepTitle emoji="🔢" title="Segment × Pijnpunt matrix" sub="Selecteer maximaal 6 combinaties voor je campagne." onHelp={onHelp} heeftNaam={!!bedrijf?.naam} />
        <div style={{ background: C.goudLight, border: `1.5px solid ${C.borderGold}`, borderRadius: 10, padding: "10px 20px", fontFamily: font.body, fontWeight: 700, fontSize: 15, color: C.goud }}>
          {combinaties.length} / 6
        </div>
      </div>
      <div style={{ overflowX: "auto", marginBottom: 24, borderRadius: 12, border: `1px solid ${C.border}` }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 500 }}>
          <thead>
            <tr style={{ background: C.bgMid }}>
              <th style={{ padding: "12px 18px", textAlign: "left", fontFamily: font.body, fontSize: 11, color: C.muted, borderBottom: `1px solid ${C.border}`, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Segment</th>
              {gekozenPijnpunten.map(pi => {
                const words = pijnpunten[pi].split(" ");
                const half = Math.ceil(words.length / 2);
                const line1 = words.slice(0, half).join(" ");
                const line2 = words.slice(half).join(" ");
                return (
                  <th key={pi} style={{ padding: "10px 8px", fontSize: 11, fontFamily: font.body, color: C.muted, borderBottom: `1px solid ${C.border}`, textAlign: "center", fontWeight: 600, maxWidth: 110, lineHeight: 1.4, verticalAlign: "bottom" }}>
                    <div>{line1}</div>
                    {line2 && <div>{line2}</div>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {segmenten.map((seg, si) => (
              <tr key={seg.id} style={{ background: si % 2 === 0 ? C.bgMid : "transparent" }}>
                <td style={{ padding: "12px 18px", fontFamily: font.body, fontWeight: 600, fontSize: 13, color: C.textSoft, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{seg.naam}</td>
                {gekozenPijnpunten.map(pi => {
                  const key = `${seg.id}_${pi}`;
                  const sel = combinaties.includes(key);
                  return (
                    <td key={pi} style={{ padding: "10px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>
                      <button onClick={() => toggle(key)} style={{ width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${sel ? C.goud : C.border}`, background: sel ? `linear-gradient(135deg, ${C.goud}, ${C.goudBright})` : "transparent", cursor: "pointer", color: sel ? "#1a1614" : C.muted, fontWeight: 800, fontSize: 16, transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                        {sel ? "✓" : "+"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {combinaties.length > 0 && (
        <div style={{ background: C.goudLight, borderRadius: 12, padding: 18, marginBottom: 24, border: `1px solid ${C.borderGold}` }}>
          <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 11, color: C.goud, marginBottom: 10, letterSpacing: "1px", textTransform: "uppercase" }}>✓ Gekozen combinaties</div>
          {gekozenLabels.map((l, i) => (
            <div key={i} style={{ fontSize: 13, fontFamily: font.body, color: C.textSoft, padding: "4px 0" }}>
              <span style={{ fontWeight: 700, color: C.goud }}>#{i + 1}</span> {l}
            </div>
          ))}
        </div>
      )}
      <Btn onClick={onNext} disabled={combinaties.length < 4}>Campagne kiezen → ({combinaties.length} / 4 min.)</Btn>
    </Card>
  );
}

// ─── STAP 6 ─────────────────────────────────────────────────────────────────

function Stap6({ bedrijf, combinaties, segmenten, pijnpunten, onNext, onBack, onHelp }) {
  const [suggesties, setSuggesties] = useState(null);
  const [gekozenSuggestie, setGekozenSuggestie] = useState(null);
  const [eigenIdee, setEigenIdee] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiGegenereerd, setAiGegenereerd] = useState(false);
  const [fout, setFout] = useState("");

  // Auto-genereer bij laden van stap 6
  useEffect(() => { genereer(); }, []);

  const samenvatting = combinaties.map(k => {
    const [sId, pIdx] = k.split("_");
    const seg = segmenten.find(s => String(s.id) === sId);
    const pp = pijnpunten[parseInt(pIdx)];
    return seg && pp ? `${seg.naam}: "${pp}"` : k;
  }).join(" | ");

  const genereer = async () => {
    setLoading(true); setAiGegenereerd(true); setFout("");
    try {
      const prompt = "Geef 4 campagne-insteken voor " + bedrijf.naam
        + " met aanbod: " + (bedrijf.aanbod || "onbekend").substring(0, 150)
        + ". Combinaties: " + samenvatting.substring(0, 200)
        + ". Kies uit: Gratis Webinar, E-book of PDF Download, Online Challenge, Quiz-funnel, Directe Verkoop, Winactie, Gratis Consult of Demo, Brochure Download."
        + " Geef een JSON array van 4 objecten met velden: type, omschrijving, doel, moeilijkheid."
        + " doel is Leads of Verkoop. moeilijkheid is Laag, Middel of Hoog."
        + " Geen uitleg. Alleen de JSON array.";
      const raw = await callClaude(
        "Je bent Meta Ads strateeg. Geef output ALLEEN als JSON array van 4 objecten. Geen uitleg, geen markdown.",
        prompt, 600
      );
      // Robuuste parsing: zoek [ ... ] in de response
      let parsed = parseJsonSafe(raw, null);
      if (!parsed) {
        const s = (raw || "").indexOf("[");
        const e = (raw || "").lastIndexOf("]");
        if (s >= 0 && e > s) parsed = parseJsonSafe(raw.substring(s, e + 1), null);
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        setSuggesties(parsed);
      } else {
        // Hardcoded fallback op basis van sector
        const aanbod = (bedrijf.aanbod || "").toLowerCase();
        const isB2B = aanbod.includes("kmo") || aanbod.includes("bedrijf") || aanbod.includes("onderneming") || aanbod.includes("b2b") || aanbod.includes("software") || aanbod.includes("consult");
        setSuggesties(isB2B ? [
          { type: "Gratis Consult/Demo", omschrijving: "Bied een gratis adviesgesprek van 30 minuten aan. Laagdrempelig instappunt voor B2B.", doel: "Leads", moeilijkheid: "Laag" },
          { type: "E-book/Whitepaper Download", omschrijving: "Geef een gratis gids weg in ruil voor een e-mailadres. Ideaal om autoriteit op te bouwen.", doel: "Leads", moeilijkheid: "Laag" },
          { type: "Gratis Webinar", omschrijving: "Organiseer een live of opgenomen webinar over een relevant thema voor je doelgroep.", doel: "Leads", moeilijkheid: "Middel" },
          { type: "Quiz-funnel", omschrijving: "Laat bezoekers hun situatie beoordelen via een korte quiz. Hoge betrokkenheid, directe segmentatie.", doel: "Leads", moeilijkheid: "Middel" },
        ] : [
          { type: "Gratis Consult", omschrijving: "Bied een gratis kennismaking of adviesgesprek aan. Werkt uitstekend voor dienstverleners.", doel: "Leads", moeilijkheid: "Laag" },
          { type: "Directe Verkoop", omschrijving: "Promoot rechtstreeks je product of dienst met een duidelijke prijs en CTA.", doel: "Verkoop", moeilijkheid: "Laag" },
          { type: "Online Challenge", omschrijving: "Een 5-daagse gratis uitdaging die direct waarde geeft en leidt naar jouw aanbod.", doel: "Leads", moeilijkheid: "Middel" },
          { type: "Winactie", omschrijving: "Snel bereik via een weggeefactie. Goed voor naamsbekendheid en e-maillijst opbouwen.", doel: "Leads", moeilijkheid: "Laag" },
        ]);
        setFout("AI-suggesties gegenereerd op basis van sectorkennis.");
      }
    } catch(e) {
      const msg = (e.message || "").substring(0, 100);
      setFout("Fout: " + msg + " — gebruik het invoerveld hieronder.");
      setSuggesties([]);
    }
    finally { setLoading(false); }
  };

  const actiefCampagne = eigenIdee.trim() ? eigenIdee.trim() : (gekozenSuggestie ? gekozenSuggestie.type : null);
  const moeilijkheidKleur = (m) => {
    if (!m) return C.muted;
    const l = m.toLowerCase();
    if (l.includes("hoog") || l.includes("gevorderd")) return C.error;
    if (l.includes("laag") || l.includes("makkelijk") || l.includes("eenvoudig")) return C.success;
    return C.goud;
  };

  return (
    <Card>
      <StepTitle emoji="🚀" title="Kies je campagne-insteek" sub="Welke formule past het best bij jouw doelgroep en aanbod?" onHelp={onHelp} heeftNaam={!!bedrijf.naam} />
      {loading && <div style={{ marginBottom: 24 }}><Loader text="AI-suggesties ophalen…" /></div>}
      {!loading && fout && (
        <div style={{ fontSize: 12, color: C.goudDim, fontFamily: font.body, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <span>ℹ️</span> {fout}
          <button onClick={genereer} style={{ marginLeft: 8, background: "transparent", border: "none", color: C.goud, fontSize: 12, cursor: "pointer", textDecoration: "underline", fontFamily: font.body }}>Opnieuw proberen</button>
        </div>
      )}
      {suggesties && suggesties.length > 0 && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
          {suggesties.map((s, i) => {
            const sel = gekozenSuggestie?.type === s.type && !eigenIdee;
            return (
              <div key={i} onClick={() => { setGekozenSuggestie(s); setEigenIdee(""); }} style={{ padding: 22, borderRadius: 14, cursor: "pointer", border: `1.5px solid ${sel ? C.goud : C.border}`, background: sel ? C.goudLight : C.bgMid, transition: "all .2s", boxShadow: sel ? C.shadowGold : "none" }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = C.borderGold; }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = C.border; }}
              >
                <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18, marginBottom: 8, color: sel ? C.goudBright : C.text }}>{sel ? "✓ " : ""}{s.type ?? ""}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 14 }}>{s.omschrijving ?? ""}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge>{s.doel ?? ""}</Badge>
                  <span style={{ display: "inline-block", padding: "4px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: font.body, background: "transparent", border: `1px solid ${moeilijkheidKleur(s.moeilijkheid)}`, color: moeilijkheidKleur(s.moeilijkheid) }}>{s.moeilijkheid ?? ""}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ marginBottom: 24 }}>
        <Input label="Of vul je eigen campagne-idee in" value={eigenIdee}
          onChange={v => { setEigenIdee(v); if (v) setGekozenSuggestie(null); }}
          placeholder="bv. Gratis strategiegesprek van 30 minuten" />
      </div>
      {actiefCampagne && (
        <div style={{ background: C.goudLight, border: `1px solid ${C.borderGold}`, borderRadius: 12, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: C.goud, fontWeight: 700, fontSize: 11, fontFamily: font.body, letterSpacing: "1px", textTransform: "uppercase" }}>Actieve keuze</span>
          <span style={{ color: C.text, fontSize: 14 }}>→ {actiefCampagne}</span>
        </div>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <Btn variant="ghost" onClick={onBack} small>← Terug</Btn>
        <Btn onClick={() => onNext(actiefCampagne)} disabled={!actiefCampagne}>Advertentieteksten genereren →</Btn>
      </div>
    </Card>
  );
}

// ─── STAP 7 ─────────────────────────────────────────────────────────────────

function CombinatieTeksten({ bedrijf, seg, pijnpunt, campagne }) {
  const [ads, setAds] = useState(null);
  const [adsRaw, setAdsRaw] = useState("");
  const [loadingAds, setLoadingAds] = useState(false);
  const [visuals, setVisuals] = useState(null);
  const [visualsRaw, setVisualsRaw] = useState("");
  const [loadingVisuals, setLoadingVisuals] = useState(false);
  const [adsGegenereerd, setAdsGegenereerd] = useState(false);
  const [visualsGegenereerd, setVisualsGegenereerd] = useState(false);

  const genereerAds = async () => {
    setLoadingAds(true); setAdsGegenereerd(true);
    try {
      // Genereer advertenties in 2 kleinere calls om rate limit te vermijden
      const sysprompt = "Je bent Meta Ads copywriter. Schrijf in het Nederlands. Output ALLEEN als JSON, geen uitleg.";
      const context = "Bedrijf: " + bedrijf.naam + ". Aanbod: " + bedrijf.aanbod.substring(0, 100)
        + ". Campagne: " + campagne + ". Segment: " + seg.naam + " (" + seg.leeftijd + ", " + seg.geslacht + ")"
        + ". Pijnpunt: " + pijnpunt;

      // Call 1: 5 advertentieteksten (Emotioneel, Rationeel, Direct probleem, Urgentie, Droom)
      const prompt1 = context + ". Schrijf 5 Meta Ads advertentieteksten (1 per hook-type: Emotioneel, Rationeel, Direct probleem, Urgentie, Droom). Elke tekst: hook + oplossing + CTA. Geef output als JSON object met veld teksten (array van objecten met hook_type en tekst).";
      const raw1 = await callClaude(sysprompt, prompt1, 1200);
      const parsed1 = parseJsonSafe(raw1, { teksten: [] });

      // Call 2: 10 kopteksten (wacht 3s)
      await new Promise(r => setTimeout(r, 3000));
      const prompt2 = context + ". Schrijf 10 korte pakkende kopteksten voor Meta Ads (max 40 tekens elk). Geef output als JSON object met veld kopteksten (array van strings).";
      const raw2 = await callClaude(sysprompt, prompt2, 400);
      const parsed2 = parseJsonSafe(raw2, { kopteksten: [] });

      const raw = JSON.stringify({ teksten: parsed1.teksten || [], kopteksten: parsed2.kopteksten || [] });
      setAdsRaw(raw); setAds(parseJsonSafe(raw, null));
    } catch (e) { setAdsRaw("Fout: " + e.message); }
    finally { setLoadingAds(false); }
  };

  const genereerVisuals = async () => {
    setLoadingVisuals(true); setVisualsGegenereerd(true);
    try {
      const raw = await callClaude(
        "Je bent creatief directeur voor Meta Ads. Geef output ALLEEN als JSON, geen uitleg.",
        `Geef 5 foto-concepten (Midjourney/DALL-E) + 5 video-concepten (Sora/Veo 3) voor:
Bedrijf: ${bedrijf.naam} | Segment: ${seg.naam} (${seg.kenmerken}) | Pijnpunt: "${pijnpunt}" | Campagne: ${campagne}
JSON: {"fotos":[{"concept":"...","prompt":"Engelse prompt","waarom":"..."}],"videos":[{"concept":"...","prompt":"Engelse prompt","opbouw":"hook(0-3s)→body(3-12s)→CTA(12-15s)","waarom":"..."}]}`,
        2000
      );
      setVisualsRaw(raw); setVisuals(parseJsonSafe(raw, null));
    } catch (e) { setVisualsRaw("Fout: " + e.message); }
    finally { setLoadingVisuals(false); }
  };

  const downloadAds = () => {
    if (!ads) return;
    const teksten = (ads.teksten ?? []).map(t => `<div class="card"><div class="hook">${t.hook_type ?? ""}</div><p style="white-space:pre-wrap;margin-top:12px">${(t.tekst ?? "").replace(/</g, "&lt;")}</p></div>`).join("");
    const kopteksten = (ads.kopteksten ?? []).map(k => `<span class="badge">${k}</span>`).join("");
    downloadHtml(`<h1>Advertentieteksten — ${seg.naam}</h1><p><strong>Bedrijf:</strong> ${bedrijf.naam} · <strong>Campagne:</strong> ${campagne}<br><em>Pijnpunt:</em> ${pijnpunt}</p><h2>Kopteksten</h2><div>${kopteksten}</div><h2>Advertentieteksten</h2>${teksten}`,
      `Advertentieteksten_${seg.naam}_${bedrijf.naam}.html`);
  };

  const downloadVisuals = () => {
    if (!visuals) return;
    const fotos = (visuals.fotos ?? []).map(f => `<div class="card"><div class="concept">📸 ${f.concept ?? ""}</div><div class="why">${f.waarom ?? ""}</div><pre>${(f.prompt ?? "").replace(/</g, "&lt;")}</pre></div>`).join("");
    const videos = (visuals.videos ?? []).map(v => `<div class="card"><div class="concept">🎬 ${v.concept ?? ""}</div><div class="why">${v.waarom ?? ""}</div><div class="opbouw">⏱ ${v.opbouw ?? ""}</div><pre>${(v.prompt ?? "").replace(/</g, "&lt;")}</pre></div>`).join("");
    downloadHtml(`<h1>Visual Prompts — ${seg.naam}</h1><p><strong>Bedrijf:</strong> ${bedrijf.naam} · <strong>Campagne:</strong> ${campagne}<br><em>Pijnpunt:</em> ${pijnpunt}</p><h2>📸 Foto-concepten</h2>${fotos}<h2>🎬 Video-concepten</h2>${videos}`,
      `VisualPrompts_${seg.naam}_${bedrijf.naam}.html`);
  };

  const preStyle = { background: C.bgMid, border: `1px solid ${C.border}`, padding: 14, borderRadius: 10, fontSize: 12, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "monospace", color: C.textSoft, lineHeight: 1.6 };

  return (
    <div>
      <Card style={{ marginBottom: 18 }}>
        <SectionHeader title="✍️ Advertentieteksten & Kopteksten">
          {loadingAds ? <Loader text="Genereren…" /> : <>
            <Btn onClick={genereerAds} small>{adsGegenereerd ? "↻ Opnieuw genereren" : "Genereer 10 advertentieteksten + kopteksten"}</Btn>
            {ads && <Btn variant="ghost" onClick={downloadAds} small>⬇ Download (.html)</Btn>}
          </>}
        </SectionHeader>
        {ads ? (
          <>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontFamily: font.body, fontWeight: 600, fontSize: 11, color: C.muted, marginBottom: 10, letterSpacing: "1px", textTransform: "uppercase" }}>Kopteksten</div>
              <div>{(ads.kopteksten ?? []).map((k, i) => <Badge key={i}>{k}</Badge>)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(ads.teksten ?? []).map((t, i) => (
                <div key={i} style={{ background: C.bgMid, borderRadius: 12, padding: 20, border: `1px solid ${C.border}` }}>
                  <span style={{ display: "inline-block", background: `linear-gradient(135deg, ${C.goud}, ${C.goudBright})`, color: "#1a1614", fontSize: 10, fontWeight: 800, padding: "4px 12px", borderRadius: 6, marginBottom: 12, fontFamily: font.body, letterSpacing: "1px", textTransform: "uppercase" }}>
                    {t.hook_type ?? ""}
                  </span>
                  <p style={{ fontFamily: font.body, fontSize: 14, lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap", color: C.textSoft }}>{(t.tekst ?? "").replace(/\\n/g, "\n")}</p>
                </div>
              ))}
            </div>
          </>
        ) : adsRaw ? <pre style={preStyle}>{adsRaw}</pre> : null}
      </Card>

      <Card>
        <SectionHeader title="🎨 Foto- & Videoprompts">
          {loadingVisuals ? <Loader text="Genereren…" /> : <>
            <Btn onClick={genereerVisuals} small>{visualsGegenereerd ? "↻ Opnieuw genereren" : "Genereer foto- & videoprompts"}</Btn>
            {visuals && <Btn variant="ghost" onClick={downloadVisuals} small>⬇ Download (.html)</Btn>}
          </>}
        </SectionHeader>
        {!visuals && !visualsRaw && <p style={{ color: C.muted, fontFamily: font.body, fontSize: 14, fontStyle: "italic" }}>Klik op de knop hierboven om foto- en videoprompts te genereren.</p>}
        {visuals && (
          <>
            <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 11, color: C.muted, marginBottom: 12, letterSpacing: "1px", textTransform: "uppercase" }}>📸 Foto-concepten</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {(visuals.fotos ?? []).map((f, i) => (
                <div key={i} style={{ background: C.bgMid, borderRadius: 12, padding: 18, border: `1px solid ${C.border}` }}>
                  <div style={{ fontFamily: font.display, fontWeight: 700, color: C.goud, fontSize: 16, marginBottom: 6 }}>{f.concept ?? ""}</div>
                  <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", marginBottom: 12 }}>{f.waarom ?? ""}</div>
                  <pre style={{ ...preStyle, fontSize: 11 }}>{f.prompt ?? ""}</pre>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 11, color: C.muted, marginBottom: 12, letterSpacing: "1px", textTransform: "uppercase" }}>🎬 Video-concepten</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {(visuals.videos ?? []).map((v, i) => (
                <div key={i} style={{ background: C.bgMid, borderRadius: 12, padding: 18, border: `1px solid ${C.border}` }}>
                  <div style={{ fontFamily: font.display, fontWeight: 700, color: C.goud, fontSize: 16, marginBottom: 6 }}>{v.concept ?? ""}</div>
                  <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", marginBottom: 6 }}>{v.waarom ?? ""}</div>
                  <div style={{ fontSize: 10, color: C.goudDim, fontWeight: 700, marginBottom: 10, letterSpacing: "1px", textTransform: "uppercase" }}>⏱ {v.opbouw ?? ""}</div>
                  <pre style={{ ...preStyle, fontSize: 11 }}>{v.prompt ?? ""}</pre>
                </div>
              ))}
            </div>
          </>
        )}
        {!visuals && visualsRaw && <pre style={preStyle}>{visualsRaw}</pre>}
      </Card>
    </div>
  );
}

function Stap7({ bedrijf, segmenten, pijnpunten, combinaties, campagne, onBack, onHelp, onNaarMeta }) {
  const [actieve, setActieve] = useState(0);
  const combs = combinaties.map(k => {
    const [sId, pIdx] = k.split("_");
    const seg = segmenten.find(s => String(s.id) === sId);
    const pp = pijnpunten[parseInt(pIdx)];
    return { seg, pijnpunt: pp, key: k };
  }).filter(c => c.seg && c.pijnpunt);
  const comb = combs[actieve];

  return (
    <div>
      <Card style={{ marginBottom: 18, padding: "20px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontFamily: font.body, fontWeight: 600, fontSize: 11, color: C.muted, letterSpacing: "1.5px", textTransform: "uppercase" }}>Combinaties</div>
          <HelpBtn onClick={onHelp} heeftNaam={!!bedrijf.naam} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {combs.map((c, i) => (
            <button key={c.key} onClick={() => setActieve(i)} style={{ padding: "9px 18px", borderRadius: 30, border: `1.5px solid ${actieve === i ? C.goud : C.border}`, background: actieve === i ? `linear-gradient(135deg, ${C.goud}, ${C.goudBright})` : "transparent", color: actieve === i ? "#1a1614" : C.muted, fontFamily: font.body, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all .18s" }}>
              {c.seg.naam} #{i + 1}
            </button>
          ))}
        </div>
        {comb && (
          <div style={{ marginTop: 14, padding: "10px 16px", background: C.goudLight, borderRadius: 10, fontSize: 13, fontFamily: font.body, border: `1px solid ${C.borderGold}` }}>
            <span style={{ fontWeight: 700, color: C.goud }}>Segment:</span>{" "}
            <span style={{ color: C.textSoft }}>{comb.seg.naam} ({comb.seg.leeftijd}, {comb.seg.geslacht})</span>
            <span style={{ color: C.border }}> · </span>
            <span style={{ fontWeight: 700, color: C.goud }}>Pijnpunt:</span>{" "}
            <span style={{ color: C.textSoft, fontStyle: "italic" }}>"{comb.pijnpunt}"</span>
          </div>
        )}
      </Card>

      {comb && <CombinatieTeksten key={actieve} bedrijf={bedrijf} seg={comb.seg} pijnpunt={comb.pijnpunt} campagne={campagne} />}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={onBack} small>← Campagne wijzigen</Btn>
          {actieve > 0 && <Btn variant="outline" onClick={() => setActieve(actieve - 1)} small>← Vorige</Btn>}
        </div>
        {actieve < combs.length - 1 && <Btn onClick={() => setActieve(actieve + 1)} small>Volgende →</Btn>}
        {actieve === combs.length - 1 && <Btn onClick={() => onNaarMeta()} small>Campagne opzetten in Meta →</Btn>}
      </div>
    </div>
  );
}


// ─── API KEY BANNER ──────────────────────────────────────────────────────────
// Hidden by default on Vercel (key is server-side). Only shows if no server key.
function ApiKeyBanner() {
  const [keyOk, setKeyOk] = useState(null); // null=checking, true=ok, false=missing
  const [key, setKey] = useState(getApiKey());
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

  useEffect(() => {
    // Quick ping to check if server has a key
    fetch("/api", {
      method: "POST",
      headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 5, system: "Reply ok.", messages: [{ role: "user", content: "ping" }] })
    }).then(r => r.json()).then(d => {
      setKeyOk(d.content ? true : false);
    }).catch(() => setKeyOk(false));
  }, []);

  // Server has key — don't show banner
  if (keyOk === null || keyOk === true) return null;

  const opslaan = async () => {
    setSaving(true); setSaveResult(null);
    setApiKey(key);
    try {
      const r = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key.trim(), "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 5, system: "Reply ok.", messages: [{ role: "user", content: "ping" }] })
      });
      const d = await r.json();
      setSaveResult(d.content ? "ok" : "fout");
      if (d.content) setKeyOk(true);
    } catch { setSaveResult("fout"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ background: "#edf7ed", borderBottom: "2px solid #1e3a20", padding: "14px 28px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span>🔑</span>
          <div>
            <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15, color: C.text }}>Anthropic API-sleutel vereist</div>
            <div style={{ fontSize: 12, color: C.muted, fontFamily: font.body }}>
              Haal je sleutel op via <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" style={{ color: "#4ade80" }}>console.anthropic.com</a> — begint met <code style={{ background: "#1a2a1a", padding: "1px 5px", borderRadius: 3, fontSize: 11 }}>sk-ant-</code>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input type="password" value={key} onChange={e => setKey(e.target.value)} onKeyDown={e => e.key === "Enter" && opslaan()}
            placeholder="sk-ant-api03-..."
            style={{ flex: 1, minWidth: 260, padding: "10px 14px", borderRadius: 9, border: "1.5px solid #1e3a20", background: "#0d1a10", color: C.text, fontFamily: "monospace", fontSize: 13, outline: "none" }} />
          <button onClick={opslaan} disabled={!key.trim() || saving}
            style={{ background: key.trim() && !saving ? "linear-gradient(135deg,#2d7a3a,#4ade80)" : "#1a2a1a", border: "none", borderRadius: 9, padding: "10px 20px", color: key.trim() && !saving ? "#111a12" : C.muted, fontFamily: font.body, fontWeight: 700, fontSize: 13, cursor: key.trim() && !saving ? "pointer" : "not-allowed" }}>
            {saving ? "Testen..." : "Opslaan & testen"}
          </button>
          {saveResult && <span style={{ fontSize: 13, fontWeight: 600, color: saveResult === "ok" ? "#4ade80" : "#f87171" }}>{saveResult === "ok" ? "✓ Verbonden!" : "✗ Ongeldige sleutel"}</span>}
        </div>
      </div>
    </div>
  );
}



// ─── STAP 8 — META CAMPAGNE OPZETTEN ────────────────────────────────────────

const META_STAPPEN = [
  {
    nr: "01", icon: "🏢",
    titel: "Meta Business Suite instellen",
    sub: "De basis vóór je begint",
    stappen: [
      "Ga naar business.facebook.com en maak een Business Account aan (of log in).",
      "Voeg je Facebook-pagina en Instagram-account toe onder 'Accounts'.",
      "Ga naar 'Advertentieaccounts' → voeg een betaalmethode toe.",
      "Installeer de Meta Pixel op je website via 'Databronnen' → 'Pixels' → 'Pixel toevoegen'. Gebruik de WordPress-plugin of plak de code in de <head> van je site.",
      "Verifieer je domein onder 'Brand Safety' → 'Domeinen'.",
    ]
  },
  {
    nr: "02", icon: "🎯",
    titel: "Campagnestructuur opzetten",
    sub: "Campagne → Advertentieset → Advertentie",
    stappen: [
      "Open Advertentiebeheer → klik 'Maken' (groene knop).",
      "Kies je campagnedoelstelling: voor leads → 'Leads genereren', voor verkoop → 'Conversies', voor naamsbekendheid → 'Bereik'.",
      "Stel het campagnebudget in (aanbevolen: €10-30/dag per advertentieset bij het testen).",
      "Per combinatie uit je matrix maak je een aparte ADVERTENTIESET aan.",
      "Elke advertentieset krijgt zijn eigen doelgroeptargeting (leeftijd, geslacht, interesses) op basis van je segment.",
      "Zet 'Advantage+ doelgroepen' uit als je zelf wil targeten.",
    ]
  },
  {
    nr: "03", icon: "👥",
    titel: "Doelgroepen instellen per advertentieset",
    sub: "Één segment = één advertentieset",
    stappen: [
      "Klik op je advertentieset → 'Doelgroep bewerken'.",
      "Locatie: kies je doelregio (België, Nederland, of specifieke steden/stralen).",
      "Leeftijd & geslacht: stel in op basis van je micro-segment uit stap 2.",
      "Gedetailleerde targeting: voeg interesses toe die passen bij het segment (bv. 'LinkedIn', 'Ondernemen', 'KMO').",
      "Tip: maak ook een Lookalike Audience aan op basis van je bestaande klanten (upload klantenlijst als CSV via 'Doelgroepen' → 'Aangepaste doelgroep').",
      "Sla de doelgroep op als template voor hergebruik.",
    ]
  },
  {
    nr: "04", icon: "📝",
    titel: "Advertenties uploaden",
    sub: "Gebruik de teksten en visuals uit stap 7",
    stappen: [
      "Binnen je advertentieset → klik 'Advertentie toevoegen'.",
      "Kies het advertentieformaat: 'Enkele afbeelding of video' of 'Carrousel' voor meerdere.",
      "Upload je visual (foto of video) uit de prompts van stap 7.",
      "Plak de primaire tekst (advertentietekst) uit stap 7 — test 2-3 varianten (A/B test).",
      "Voeg de koptekst toe (één van de 10 kopteksten uit stap 7).",
      "Stel de CTA-knop in: 'Meer info', 'Aanmelden', 'Offerte aanvragen', enz. passend bij je campagne.",
      "Voeg de bestemmings-URL in (je landingspagina of leadformulier).",
    ]
  },
  {
    nr: "05", icon: "📊",
    titel: "Meten en optimaliseren",
    sub: "Na 3-5 dagen je eerste resultaten analyseren",
    stappen: [
      "Open Advertentiebeheer → bekijk de kolommen: Bereik, Vertoningen, CTR, Kosten per resultaat.",
      "Pauzeer advertentiesets met een CTR onder 1% na €30 besteed — die werken niet.",
      "Schaal succesvolle advertentiesets op: verhoog budget met max 20% per dag.",
      "Test elke 2 weken een nieuwe hook-variant (andere emotie of invalshoek).",
      "Maak Retargeting-campagnes aan voor bezoekers die je website bezochten maar niet converteerden.",
      "Vergelijk je combinaties: welk segment × pijnpunt scoort het best? Zet daar meer budget op.",
    ]
  },
  {
    nr: "06", icon: "🔑",
    titel: "Handige links",
    sub: "Direct openen in Meta",
    links: [
      { label: "Meta Advertentiebeheer", url: "https://business.facebook.com/adsmanager" },
      { label: "Meta Business Suite", url: "https://business.facebook.com" },
      { label: "Meta Doelgroepen", url: "https://business.facebook.com/adsmanager/audiences" },
      { label: "Meta Pixel instellen", url: "https://business.facebook.com/events_manager" },
      { label: "Meta Blueprint (gratis training)", url: "https://www.facebook.com/business/learn" },
      { label: "Meta Advertentiespecificaties", url: "https://www.facebook.com/business/ads-guide" },
    ]
  }
];

function Stap8({ onBack, onNaarEvaluatie }) {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: "32px 36px", boxShadow: C.shadow, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 28 }}>🚀</span>
          <h2 style={{ fontFamily: font.display, fontWeight: 700, fontSize: 26, margin: 0, color: C.navy, letterSpacing: "-.5px" }}>
            Campagne opzetten in Meta
          </h2>
        </div>
        <p style={{ color: C.muted, fontSize: 14, fontFamily: font.body, marginBottom: 0, paddingLeft: 40 }}>
          Volg deze stappen om je gegenereerde advertenties live te zetten in Meta Ads Manager.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {META_STAPPEN.map((ms, i) => (
          <div key={i} style={{ background: C.card, borderRadius: 14, border: `1px solid ${open === i ? C.goud : C.border}`, boxShadow: C.shadow, overflow: "hidden", transition: "border .2s" }}>
            {/* Header */}
            <div onClick={() => setOpen(open === i ? null : i)} style={{ padding: "18px 24px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, userSelect: "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${C.goud},${C.goudBright})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.display, fontWeight: 800, fontSize: 13, color: "#1a1208", flexShrink: 0 }}>
                {ms.nr}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{ms.icon}</span>
                  <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 17, color: C.text }}>{ms.titel}</span>
                </div>
                <div style={{ fontSize: 12, color: C.muted, fontFamily: font.body, marginTop: 2 }}>{ms.sub}</div>
              </div>
              <span style={{ color: C.goud, fontSize: 20, fontWeight: 700, transition: "transform .2s", transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
            </div>

            {/* Content */}
            {open === i && (
              <div style={{ padding: "0 24px 20px", borderTop: `1px solid ${C.border}` }}>
                {ms.stappen && (
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                    {ms.stappen.map((stap, si) => (
                      <div key={si} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.goudLight, border: `1.5px solid ${C.goud}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.body, fontWeight: 700, fontSize: 11, color: C.goud, flexShrink: 0, marginTop: 1 }}>{si + 1}</div>
                        <div style={{ fontFamily: font.body, fontSize: 13, color: C.textSoft, lineHeight: 1.65 }}>{stap}</div>
                      </div>
                    ))}
                  </div>
                )}
                {ms.links && (
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
                    {ms.links.map((lnk, li) => (
                      <a key={li} href={lnk.url} target="_blank" rel="noopener"
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 9, background: C.goudLight, border: `1px solid ${C.borderGold}`, color: C.goud, fontFamily: font.body, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                        <span style={{ fontSize: 16 }}>↗</span> {lnk.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ background: C.goudLight, border: `1px solid ${C.borderGold}`, borderRadius: 10, padding: "10px 20px", color: C.goud, fontFamily: font.body, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          ← Terug naar advertenties
        </button>
        <button onClick={onNaarEvaluatie} style={{ background: `linear-gradient(135deg,${C.goud},${C.goudBright})`, border: "none", borderRadius: 10, padding: "10px 20px", color: "#1a1208", fontFamily: font.body, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
          📊 Evalueer lopende campagnes →
        </button>
      </div>
    </div>
  );
}


// ─── SECTOR PLAYBOOKS ─────────────────────────────────────────────────────────
const SECTOR_PLAYBOOKS = {
  energie: {
    label: "Zonnepanelen / Warmtepompen",
    kpi_focus: ["CPL", "lead-naar-afspraak%", "offerte-conversie%"],
    typisch_cpl: "€25–€60",
    typisch_ctr: "1.2–2.5%",
    seizoen: ["jan-mrt piek", "zomer rustig", "sept-nov opnieuw actief"],
    hooks: ["Energiefactuur verlagen", "Terugverdientijd < 5 jaar", "Premies & subsidies"],
    waarschuwingen: ["Lange salescyclus → meet kwaliteit, niet alleen volume", "Veel concurrenten → differentieer op trust"],
  },
  bouw: {
    label: "Dakwerken / Renovatie / Ramen & Deuren",
    kpi_focus: ["CPL", "afspraak-ratio", "offertewaarde"],
    typisch_cpl: "€30–€80",
    typisch_ctr: "0.8–1.8%",
    seizoen: ["lente piek", "winter rustig"],
    hooks: ["Gratis schatting aan huis", "X jaar garantie", "Erkend aannemer"],
    waarschuwingen: ["Hoge ticketwaarde → kwaliteit > volume", "Vertrouwen is sleutelwoord"],
  },
  dienstverlening: {
    label: "Boekhouders / Kinesisten / Lokale dienstverlening",
    kpi_focus: ["CPL", "afspraak-boekingen", "opvolgingsratio"],
    typisch_cpl: "€15–€40",
    typisch_ctr: "1.5–3%",
    seizoen: ["geen sterk seizoenspatroon"],
    hooks: ["Gratis kennismakingsgesprek", "Lokale specialist", "Snel resultaat"],
    waarschuwingen: ["Nabijheid belangrijk → gebruik lokale targeting", "Persoonlijkheid verkoopt"],
  },
  interieur: {
    label: "Interieur / Verbouwing",
    kpi_focus: ["CPL", "showroom-bezoeken", "project-conversie"],
    typisch_cpl: "€40–€100",
    typisch_ctr: "0.6–1.5%",
    seizoen: ["jan-mrt inspiratiepiek", "herfst verbouwingspiek"],
    hooks: ["Voor/na resultaten", "Gratis interieuradvies", "Inspiratie op maat"],
    waarschuwingen: ["Visuals zijn alles", "Lange beslissingscyclus"],
  },
};

function detecteerSector(aanbod) {
  const a = (aanbod || "").toLowerCase();
  if (a.match(/zonnepaneel|warmtepomp|energie|batterij|solar/)) return "energie";
  if (a.match(/dak|renovatie|ramen|deuren|bouw|aannemer|schrijnwerk/)) return "bouw";
  if (a.match(/boekhouder|kinesist|coach|dienst|advies|consult/)) return "dienstverlening";
  if (a.match(/interieur|meubel|verbouw|inrichting/)) return "interieur";
  return null;
}

// ─── EVALUATIE HELPERS ────────────────────────────────────────────────────────

function parseEvaluatieData(csvTekst) {
  // Parse campagnedata naar bruikbare objecten
  if (!csvTekst || csvTekst.trim().length < 20) return [];
  const sep = String.fromCharCode(10);
  const regels = csvTekst.split(sep).map(r => r.trim()).filter(r => r.length > 5);
  if (regels.length < 2) return [];

  // Zoek header rij
  const headerIdx = regels.findIndex(r =>
    r.toLowerCase().includes("campagne") || r.toLowerCase().includes("naam") ||
    r.toLowerCase().includes("advertentie") || r.toLowerCase().includes("budget")
  );
  if (headerIdx < 0) return [];

  const headers = regels[headerIdx].split(/[;,\t]/).map(h => h.trim().toLowerCase());
  const rows = [];
  for (let i = headerIdx + 1; i < regels.length; i++) {
    const cols = regels[i].split(/[;,\t]/);
    if (cols.length < 2) continue;
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (cols[idx] || "").trim(); });
    rows.push(obj);
  }
  return rows;
}

function berekeningSignalen(rows) {
  // Detecteer tracking health signalen vanuit de data
  const signalen = [];
  if (rows.length === 0) {
    signalen.push({ type: "fout", tekst: "Geen parseerbare campagnerijen gevonden — controleer CSV-formaat." });
    return signalen;
  }
  const totaalBudget = rows.reduce((s, r) => {
    const b = parseFloat((r["besteed bedrag (eur)"] || r["kosten"] || r["budget"] || "0").replace(",", ".")) || 0;
    return s + b;
  }, 0);
  const totaalResultaten = rows.reduce((s, r) => {
    const res = parseInt(r["resultaten"] || r["conversies"] || r["leads"] || "0") || 0;
    return s + res;
  }, 0);
  if (totaalBudget > 0 && totaalResultaten === 0) {
    signalen.push({ type: "kritiek", tekst: "Geen conversies geregistreerd terwijl er budget gespendeerd is — mogelijk tracking-probleem." });
  }
  if (totaalResultaten > 0 && totaalBudget === 0) {
    signalen.push({ type: "waarschuwing", tekst: "Resultaten geregistreerd maar geen budgetdata — incomplete export." });
  }
  const zonderDelivery = rows.filter(r => {
    const v = (r["advertentieweergave"] || r["weergaven"] || r["vertoningen"] || "").toLowerCase();
    return v === "not delivering" || v === "0" || v === "";
  });
  if (zonderDelivery.length > 0) {
    signalen.push({ type: "waarschuwing", tekst: `${zonderDelivery.length} advertentie(s) zonder weergaven — mogelijk gepauzeerd of afgewezen.` });
  }
  if (rows.length < 3) {
    signalen.push({ type: "info", tekst: "Weinig datapunten — conclusies zijn indicatief, niet statistisch betrouwbaar." });
  }
  return signalen;
}

// ─── STAP 9 — CAMPAGNE EVALUATIE (versterkt) ─────────────────────────────────

function Stap9({ bedrijf, csvData, onBack }) {
  const [handmatig, setHandmatig] = useState(csvData || "");
  const [loading, setLoading] = useState(false);
  const [resultaat, setResultaat] = useState(null);
  const [fout, setFout] = useState("");
  const [actieTab, setActieTab] = useState("evaluatie"); // evaluatie | tests | samenvatting

  const sector = detecteerSector(bedrijf.aanbod);
  const playbook = sector ? SECTOR_PLAYBOOKS[sector] : null;
  const dataRows = parseEvaluatieData(handmatig || csvData || "");
  const trackingSignalen = berekeningSignalen(dataRows);

  const evalueer = async () => {
    const data = (handmatig || csvData || "").trim();
    if (!data) { setFout("Voeg eerst campagnedata toe."); return; }
    setLoading(true); setFout(""); setResultaat(null);
    try {
      const sectorCtx = playbook
        ? ` Sector: ${playbook.label}. Typische CPL: ${playbook.typisch_cpl}. Typische CTR: ${playbook.typisch_ctr}.`
        : "";
      const prompt = "Je bent een Meta Ads expert die advies geeft aan een zelfstandige ondernemer."
        + " Evalueer deze campagnedata voor " + bedrijf.naam + "."
        + (bedrijf.aanbod ? " Aanbod: " + bedrijf.aanbod.substring(0, 100) + "." : "")
        + sectorCtx
        + " Data:\n" + data.substring(0, 3000)
        + "\n\nGeef voor ELKE campagne of advertentie:"
        + "\n- BESLISSING: STOP DIRECT / OPTIMALISEER / BLIJVEN LOPEN / OPSCHALEN"
        + "\n- CONFIDENCE: Hoog/Middel/Laag (hoeveel data er is)"
        + "\n- IMPACT: Hoog/Middel/Laag (financieel belang)"
        + "\n- 3 REDENEN: waarom deze beslissing"
        + "\n- NEXT ACTION: 1 concrete volgende stap"
        + "\n\nSluit af met:"
        + "\nBUDGET GUARDIAN: waarschuwingen voor slechte optimalisatiebeslissingen"
        + "\nCREATIEVE FATIGUE: welke advertenties signalen van slijtage tonen"
        + "\nDAILY SUMMARY: 1 alinea, menselijke taal, wat de ondernemer vandaag doet"
        + "\n\nSchrijf in het Nederlands. Gebruik geen jargon. Wees direct en concreet.";

      const raw = await callClaude(
        "Je bent een eerlijke Meta Ads coach voor kleine ondernemers. Geef scherpe, bruikbare adviezen.",
        prompt, 1500
      );
      setResultaat(raw);
    } catch(e) {
      setFout("Fout: " + (e.message || String(e)).substring(0, 150));
    }
    finally { setLoading(false); }
  };

  const downloadPdf = () => {
    const datum = new Date().toLocaleDateString("nl-BE", { day: "2-digit", month: "2-digit", year: "numeric" });
    const tekst = resultaat || "";
    const sep = String.fromCharCode(10);
    const regels = tekst.split(sep);
    let html = "";
    let huidigType = null;
    for (const regel of regels) {
      const r = regel.trim().replace(/[*]{1,2}([^*]*)[*]{1,2}/g, "$1").replace(/^[#]+ /, "");
      if (!r) { html += "<br/>"; continue; }
      const upper = r.toUpperCase();
      if (upper.startsWith("STOP")) {
        huidigType = "stop"; html += "<div class='sh stop'>🔴 STOP DIRECT</div>";
      } else if (upper.startsWith("OPTIMALISEER") || upper.startsWith("BIJSTUREN")) {
        huidigType = "opt"; html += "<div class='sh opt'>🟡 OPTIMALISEER</div>";
      } else if (upper.startsWith("BLIJVEN") || upper.startsWith("VERDER")) {
        huidigType = "verd"; html += "<div class='sh verd'>🟢 BLIJVEN LOPEN</div>";
      } else if (upper.startsWith("OPSCHALEN")) {
        huidigType = "schaal"; html += "<div class='sh schaal'>🚀 OPSCHALEN</div>";
      } else if (upper.startsWith("BUDGET GUARDIAN")) {
        huidigType = null; html += "<div class='sh guard'>🛡️ BUDGET GUARDIAN</div>";
      } else if (upper.startsWith("CREATIEVE FATIGUE")) {
        huidigType = null; html += "<div class='sh fat'>⚡ CREATIEVE FATIGUE</div>";
      } else if (upper.startsWith("DAILY SUMMARY")) {
        huidigType = null; html += "<div class='sh sum'>📋 DAGELIJKSE SAMENVATTING</div>";
      } else {
        const cls = huidigType === "stop" ? "i-stop" : huidigType === "opt" ? "i-opt" : huidigType === "verd" ? "i-verd" : huidigType === "schaal" ? "i-schaal" : "i-neu";
        html += "<div class='" + cls + "'>" + r.replace(/</g, "&lt;") + "</div>";
      }
    }
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"/>
<title>Campagne Evaluatie - ${bedrijf.naam}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1208;background:#fff;padding:40px;max-width:800px;margin:0 auto}
.header{border-bottom:3px solid #D4A847;padding-bottom:20px;margin-bottom:24px}
.header h1{font-size:22px;color:#D4A847;margin-bottom:4px}
.header .sub{font-size:12px;color:#6b6050}
.sh{font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding:7px 12px;border-radius:6px;margin:16px 0 6px}
.stop{background:#ffeeee;color:#cc2200;border-left:4px solid #cc2200}
.opt{background:#fff8e0;color:#e08000;border-left:4px solid #e08000}
.verd{background:#eeffee;color:#1a6b1a;border-left:4px solid #1a6b1a}
.schaal{background:#e8f0ff;color:#1a3a8a;border-left:4px solid #1a3a8a}
.guard{background:#fff3e0;color:#b05000;border-left:4px solid #b05000}
.fat{background:#FDF5DC;color:#D4A847;border-left:4px solid #D4A847}
.sum{background:#f5f0ff;color:#4a2a8a;border-left:4px solid #4a2a8a}
.i-stop{background:#fff5f5;border:1px solid #ffcccc;border-radius:5px;padding:7px 12px;margin-bottom:5px;font-size:13px;color:#5a0000;line-height:1.6}
.i-opt{background:#fffbf0;border:1px solid #f0d880;border-radius:5px;padding:7px 12px;margin-bottom:5px;font-size:13px;color:#5a3000;line-height:1.6}
.i-verd{background:#f5fff5;border:1px solid #aaddaa;border-radius:5px;padding:7px 12px;margin-bottom:5px;font-size:13px;color:#003300;line-height:1.6}
.i-schaal{background:#f0f5ff;border:1px solid #aac0ee;border-radius:5px;padding:7px 12px;margin-bottom:5px;font-size:13px;color:#00115a;line-height:1.6}
.i-neu{background:#fdfaf5;border:1px solid #e8dfc8;border-radius:5px;padding:7px 12px;margin-bottom:5px;font-size:13px;color:#3a2f18;line-height:1.6}
.footer{margin-top:30px;padding-top:12px;border-top:1px solid #e8dfc8;font-size:10px;color:#aaa;display:flex;justify-content:space-between}
</style></head><body>
<div class="header"><h1>📊 Campagne Evaluatie</h1>
<div class="sub">${bedrijf.naam}${bedrijf.aanbod ? " · " + bedrijf.aanbod.substring(0,60) : ""} · ${datum}</div></div>
${html}
<div class="footer"><span>Meta Ads Bureau · Verdify · verdify.eu</span><span>${datum}</span></div>
<script>setTimeout(()=>window.print(),400);<\/script>
</body></html>`);
    win.document.close();
  };

  // Render gekleurde evaluatieblokken
  const renderEvaluatie = (tekst) => {
    if (!tekst) return null;
    const sep = String.fromCharCode(10);
    const elementen = [];
    let huidigType = null;
    const klDot = { stop: "#cc2200", opt: "#e08000", verd: "#1a6b1a", schaal: "#1a3a8a" };
    const klBg  = { stop: "#fff5f5", opt: "#fffbf0", verd: "#f5fff5", schaal: "#f0f5ff", neu: C.goudLight };
    const klBrd = { stop: "#ffcccc", opt: "#f0d880", verd: "#aaddaa", schaal: "#aac0ee", neu: C.borderGold };
    const klTxt = { stop: "#5a0000", opt: "#5a3000", verd: "#003300", schaal: "#00115a", neu: C.textSoft };

    tekst.split(sep).forEach((regel, i) => {
      let r = regel.trim()
        .replace(/[*]{1,2}([^*]*)[*]{1,2}/g, "$1")
        .replace(/^[#]+ /, "")
        .replace(/^[-] /, "");
      if (!r) return;
      const up = r.toUpperCase();

      const header = (emoji, label, type, dotKleur) => elementen.push(
        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, margin:"20px 0 8px" }}>
          <div style={{ width:14, height:14, borderRadius:"50%", background:dotKleur, flexShrink:0 }} />
          <span style={{ fontFamily:font.body, fontWeight:800, fontSize:12, color:dotKleur, textTransform:"uppercase", letterSpacing:"1.5px" }}>
            {emoji} {label}
          </span>
        </div>
      );

      if (up.startsWith("STOP"))           { huidigType="stop";  header("🔴","Stop direct","stop","#cc2200"); }
      else if (up.match(/^OPTIMALISEER|^BIJSTUREN/)) { huidigType="opt"; header("🟡","Optimaliseer","opt","#e08000"); }
      else if (up.match(/^BLIJVEN|^VERDER/))         { huidigType="verd"; header("🟢","Blijven lopen","verd","#1a6b1a"); }
      else if (up.startsWith("OPSCHALEN"))  { huidigType="schaal"; header("🚀","Opschalen","schaal","#1a3a8a"); }
      else if (up.startsWith("BUDGET GUARDIAN")) {
        huidigType=null;
        elementen.push(<div key={i} style={{ margin:"22px 0 8px", fontFamily:font.body, fontWeight:800, fontSize:12, color:"#b05000", textTransform:"uppercase", letterSpacing:"1.5px" }}>🛡️ Budget Guardian</div>);
      } else if (up.startsWith("CREATIEVE FATIGUE")) {
        huidigType=null;
        elementen.push(<div key={i} style={{ margin:"22px 0 8px", fontFamily:font.body, fontWeight:800, fontSize:12, color:C.goud, textTransform:"uppercase", letterSpacing:"1.5px" }}>⚡ Creatieve Fatigue</div>);
      } else if (up.startsWith("DAILY SUMMARY") || up.startsWith("DAGELIJKSE")) {
        huidigType=null;
        elementen.push(<div key={i} style={{ margin:"22px 0 8px", fontFamily:font.body, fontWeight:800, fontSize:12, color:"#4a2a8a", textTransform:"uppercase", letterSpacing:"1.5px" }}>📋 Dagelijkse Samenvatting</div>);
      } else {
        const t = huidigType || "neu";
        elementen.push(
          <div key={i} style={{ background:klBg[t]||klBg.neu, border:"1px solid "+(klBrd[t]||klBrd.neu), borderRadius:8, padding:"8px 14px", marginBottom:5, fontFamily:font.body, fontSize:13, color:klTxt[t]||klTxt.neu, lineHeight:1.65 }}>
            {huidigType==="stop"?"🔴 ":huidigType==="opt"?"🟡 ":huidigType==="verd"?"🟢 ":huidigType==="schaal"?"🚀 ":""}{r}
          </div>
        );
      }
    });
    return <div>{elementen}</div>;
  };

  // Next-best test generator
  const [tests, setTests] = useState(null);
  const [loadingTests, setLoadingTests] = useState(false);

  const genereerTests = async () => {
    const data = (handmatig || csvData || "").trim();
    setLoadingTests(true);
    try {
      const prompt = "Genereer 4 concrete A/B-testvoorstellen voor Meta Ads campagnes van " + bedrijf.naam
        + (bedrijf.aanbod ? " (aanbod: " + bedrijf.aanbod.substring(0,100) + ")" : "")
        + (data ? ". Campagnedata:\n" + data.substring(0, 1500) : "")
        + "\n\nPer test:\n- TYPE: Headline / Hook / Visual / CTA / Doelgroep\n- HYPOTHESE: wat verwacht je\n- VERWACHT EFFECT: concreet % of richting\n- RISICO: Laag/Middel/Hoog\n- PRIORITEIT: 1-4\n- HOE: 1 concrete implementatiestap"
        + "\n\nSchrijf in het Nederlands. Wees concreet en bruikbaar voor een zelfstandige.";
      const raw = await callClaude("Je bent een Meta Ads teststrateeg. Geef 4 concrete testvoorstellen.", prompt, 900);
      setTests(raw);
    } catch(e) {
      setTests("Fout bij genereren: " + (e.message || "").substring(0, 80));
    }
    setLoadingTests(false);
  };

  const SignaalBadge = ({ signaal }) => {
    const kl = signaal.type === "kritiek" ? "#cc2200" : signaal.type === "waarschuwing" ? "#e08000" : signaal.type === "fout" ? "#cc2200" : "#1a6b1a";
    const bg = signaal.type === "kritiek" ? "#fff0f0" : signaal.type === "waarschuwing" ? "#fff8e0" : signaal.type === "fout" ? "#fff0f0" : "#f0fff0";
    const icoon = signaal.type === "kritiek" ? "🔴" : signaal.type === "waarschuwing" ? "⚠️" : signaal.type === "fout" ? "❌" : "ℹ️";
    return (
      <div style={{ background:bg, border:`1px solid ${kl}44`, borderRadius:8, padding:"8px 14px", marginBottom:6, display:"flex", gap:8, alignItems:"flex-start" }}>
        <span style={{ flexShrink:0 }}>{icoon}</span>
        <span style={{ fontFamily:font.body, fontSize:13, color:kl, lineHeight:1.6 }}>{signaal.tekst}</span>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background:C.card, borderRadius:18, border:`1px solid ${C.border}`, padding:"28px 32px", boxShadow:C.shadow, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <span style={{ fontSize:26 }}>📊</span>
          <div>
            <h2 style={{ fontFamily:font.display, fontWeight:700, fontSize:22, margin:0, color:C.navy }}>Campagne Evaluatie</h2>
            <p style={{ color:C.muted, fontSize:13, fontFamily:font.body, margin:0 }}>
              AI-coach analyseert je campagnes — wat stoppen, optimaliseren, opschalen of testen
            </p>
          </div>
        </div>
        {playbook && (
          <div style={{ marginTop:10, background:C.goudLight, border:`1px solid ${C.borderGold}`, borderRadius:10, padding:"8px 14px", display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ fontFamily:font.body, fontWeight:700, fontSize:11, color:C.goud, textTransform:"uppercase", letterSpacing:"1px" }}>Sector playbook</span>
            <span style={{ fontFamily:font.body, fontSize:12, color:C.textSoft }}>{playbook.label}</span>
            <span style={{ fontFamily:font.body, fontSize:11, color:C.muted }}>Typische CPL: {playbook.typisch_cpl} · CTR: {playbook.typisch_ctr}</span>
          </div>
        )}
      </div>

      {/* Data invoer */}
      <div style={{ background:C.card, borderRadius:14, border:`1px solid ${C.border}`, padding:"22px 26px", boxShadow:C.shadow, marginBottom:14 }}>
        <div style={{ fontFamily:font.display, fontWeight:700, fontSize:15, color:C.text, marginBottom:14 }}>📥 Campagnedata</div>
        {csvData ? (
          <div style={{ background:"#f0fff0", border:"1.5px solid #80cc80", borderRadius:10, padding:"12px 16px", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
            <span>✅</span>
            <div>
              <div style={{ fontFamily:font.body, fontWeight:700, fontSize:13, color:"#1a6b1a" }}>CSV geladen vanuit stap 2</div>
              <div style={{ fontSize:11, color:C.muted, fontFamily:font.body }}>{csvData.length} tekens campagnedata</div>
            </div>
          </div>
        ) : (
          <div style={{ background:C.goudLight, border:`1.5px dashed ${C.borderGold}`, borderRadius:10, padding:"12px 16px", marginBottom:12 }}>
            <div style={{ fontFamily:font.body, fontWeight:700, fontSize:13, color:C.goud, marginBottom:3 }}>📂 Geen CSV geladen vanuit stap 2</div>
            <div style={{ fontSize:11, color:C.muted, fontFamily:font.body }}>Ga terug naar stap 2 voor CSV-upload, of plak data hieronder.</div>
          </div>
        )}
        <textarea
          value={handmatig}
          onChange={e => setHandmatig(e.target.value)}
          rows={6}
          placeholder={"Campagnenaam | Budget | Bereik | Klikken | CTR | CPC | Kosten | Conversies\n\nBv:\nZonnepanelen-lead | €500 | 12.400 | 960 | 2% | €0,52 | €499 | 8"}
          style={{ width:"100%", boxSizing:"border-box", padding:"10px 12px", borderRadius:10, border:`1px solid ${C.border}`, fontFamily:"monospace", fontSize:12, background:"#fafaf8", color:C.text, resize:"vertical" }}
        />
        {fout && <div style={{ color:"#cc2200", fontSize:13, fontFamily:font.body, marginTop:8 }}>{fout}</div>}

        {/* Tracking Health Check */}
        {trackingSignalen.length > 0 && (
          <div style={{ marginTop:12 }}>
            <div style={{ fontFamily:font.body, fontWeight:700, fontSize:12, color:C.goudDim, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>🔍 Tracking Health Check</div>
            {trackingSignalen.map((s, i) => <SignaalBadge key={i} signaal={s} />)}
          </div>
        )}

        <div style={{ marginTop:14 }}>
          {loading
            ? <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0" }}>
                <span style={{ width:18, height:18, border:`3px solid ${C.border}`, borderTop:`3px solid ${C.goud}`, borderRadius:"50%", animation:"spin 1s linear infinite", display:"inline-block" }} />
                <span style={{ fontFamily:font.body, fontSize:14, color:C.muted }}>AI analyseert je campagnes…</span>
              </div>
            : <button onClick={evalueer} style={{ background:`linear-gradient(135deg,${C.goud},${C.goudBright})`, border:"none", borderRadius:11, padding:"11px 26px", color:"#1a1208", fontFamily:font.body, fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
                📊 Evalueer campagnes
              </button>
          }
        </div>
      </div>

      {/* Tabs: Evaluatie / Tests / Samenvatting */}
      {resultaat && (
        <div style={{ marginBottom:14 }}>
          <div style={{ display:"flex", gap:4, marginBottom:14, background:C.bgMid, borderRadius:12, padding:4 }}>
            {[
              { id:"evaluatie", label:"📊 Evaluatie" },
              { id:"tests", label:"🧪 Next-best Tests" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActieTab(tab.id)} style={{
                flex:1, padding:"9px 14px", borderRadius:9, border:"none", cursor:"pointer",
                background: actieTab === tab.id ? C.card : "transparent",
                boxShadow: actieTab === tab.id ? C.shadow : "none",
                fontFamily:font.body, fontWeight:700, fontSize:13,
                color: actieTab === tab.id ? C.text : C.muted,
                transition:"all .15s",
              }}>{tab.label}</button>
            ))}
          </div>

          {actieTab === "evaluatie" && (
            <div style={{ background:C.card, borderRadius:14, border:`1px solid ${C.border}`, padding:"22px 26px", boxShadow:C.shadow }}>
              {renderEvaluatie(resultaat)}
            </div>
          )}

          {actieTab === "tests" && (
            <div style={{ background:C.card, borderRadius:14, border:`1px solid ${C.border}`, padding:"22px 26px", boxShadow:C.shadow }}>
              <div style={{ fontFamily:font.body, fontWeight:700, fontSize:13, color:C.goud, textTransform:"uppercase", letterSpacing:"1px", marginBottom:12 }}>🧪 Next-best Test Voorstellen</div>
              {!tests && !loadingTests && (
                <div>
                  <p style={{ fontFamily:font.body, fontSize:13, color:C.muted, marginBottom:14, lineHeight:1.7 }}>
                    Genereer concrete A/B-testvoorstellen op basis van je campagnedata: welke headlines, hooks, visuals of doelgroepen testen?
                  </p>
                  <button onClick={genereerTests} style={{ background:`linear-gradient(135deg,${C.goud},${C.goudBright})`, border:"none", borderRadius:10, padding:"10px 22px", color:"#1a1208", fontFamily:font.body, fontWeight:700, fontSize:13, cursor:"pointer" }}>
                    Genereer testvoorstellen →
                  </button>
                </div>
              )}
              {loadingTests && <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ width:16, height:16, border:`2px solid ${C.border}`, borderTop:`2px solid ${C.goud}`, borderRadius:"50%", animation:"spin 1s linear infinite", display:"inline-block" }} />
                <span style={{ fontFamily:font.body, fontSize:13, color:C.muted }}>Testvoorstellen genereren…</span>
              </div>}
              {tests && !loadingTests && (
                <div style={{ fontFamily:font.body, fontSize:13, color:C.textSoft, lineHeight:1.75, whiteSpace:"pre-wrap" }}>{tests}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer knoppen */}
      <div style={{ marginTop:12, display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
        <button onClick={onBack} style={{ background:C.goudLight, border:`1px solid ${C.borderGold}`, borderRadius:10, padding:"10px 20px", color:C.goud, fontFamily:font.body, fontWeight:600, fontSize:13, cursor:"pointer" }}>
          ← Terug naar Meta Setup
        </button>
        {resultaat && (
          <button onClick={downloadPdf} style={{ background:`linear-gradient(135deg,${C.goud},${C.goudBright})`, border:"none", borderRadius:10, padding:"10px 22px", color:"#1a1208", fontFamily:font.body, fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
            📄 Download evaluatie als PDF
          </button>
        )}
      </div>
    </div>
  );
}


// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function App() {
  const [stap, setStap] = useState(1);
  const [bedrijf, setBedrijf] = useState({ naam: "", url: "", aanbod: "" });
  const [segmenten, setSegmenten] = useState(FALLBACK_SEGMENTEN);
  const [pijnpunten, setPijnpunten] = useState(FALLBACK_PIJNPUNTEN);
  const [gekozenPijnpunten, setGekozenPijnpunten] = useState([]);
  const [combinaties, setCombinaties] = useState([]);
  const [campagne, setCampagne] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [stap8Open, setStap8Open] = useState(false);
  const [csvData, setCsvData] = useState(""); // CSV uit stap 2 hergebruikt in stap 9

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font.body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        * { box-sizing: border-box; }
        ::placeholder { color: ${C.muted}; opacity: 1; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${C.bgMid}; }
        ::-webkit-scrollbar-thumb { background: ${C.borderGold}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.goudDim}; }
      `}</style>

      {/* Help Drawer */}
      <HelpDrawer stap={stap} bedrijf={bedrijf} open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* API Key Banner */}
      <ApiKeyBanner />


      {/* Header */}
      <div style={{ background: C.navy, borderBottom: "1px solid #2E3D58", padding: "0 28px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 8px 40px rgba(28,35,51,.6)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: `linear-gradient(135deg, ${C.goud}, ${C.goudBright})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, boxShadow: C.shadowGold, color: "#1a1614", fontWeight: 800,
            }}>◆</div>
            <div>
              <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 19, color: "#F0EFE9", lineHeight: 1, letterSpacing: "-.3px" }}>Meta Ads Bureau</div>
              <div style={{ fontSize: 10, color: "#D4A847", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" }}>AI Campagne Builder</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {bedrijf.naam && (
              <div style={{ background: "rgba(212,168,71,.15)", border: "1px solid rgba(212,168,71,.4)", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, color: "#D4A847", fontFamily: font.body }}>
                {bedrijf.naam}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 80px" }}>
        <ProgressBar stap={stap} />
        {stap === 1 && <Stap1 data={bedrijf} setData={setBedrijf} onNext={() => setStap(2)} onHelp={() => setHelpOpen(true)} />}
        {stap === 2 && <Stap2 bedrijf={bedrijf} onCsvData={setCsvData} onNext={segs => { setSegmenten(segs); setStap(3); }} onHelp={() => setHelpOpen(true)} />}
        {stap === 3 && <Stap3 bedrijf={bedrijf} segmenten={segmenten} setSegmenten={setSegmenten} onNext={pp => { setPijnpunten(pp); setStap(4); }} onHelp={() => setHelpOpen(true)} />}
        {stap === 4 && <Stap4 pijnpunten={pijnpunten} gekozen={gekozenPijnpunten} setGekozen={setGekozenPijnpunten} onNext={() => setStap(5)} bedrijf={bedrijf} onHelp={() => setHelpOpen(true)} />}
        {stap === 5 && <Stap5 segmenten={segmenten} pijnpunten={pijnpunten} gekozenPijnpunten={gekozenPijnpunten} combinaties={combinaties} setCombinaties={setCombinaties} onNext={() => setStap(6)} bedrijf={bedrijf} onHelp={() => setHelpOpen(true)} />}
        {stap === 6 && <Stap6 bedrijf={bedrijf} combinaties={combinaties} segmenten={segmenten} pijnpunten={pijnpunten} onNext={c => { setCampagne(c); setStap(7); }} onBack={() => setStap(5)} onHelp={() => setHelpOpen(true)} />}
        {stap === 7 && <Stap7 bedrijf={bedrijf} segmenten={segmenten} pijnpunten={pijnpunten} combinaties={combinaties} campagne={campagne} onBack={() => setStap(6)} onHelp={() => setHelpOpen(true)} onNaarMeta={() => setStap(8)} />}
        {stap === 8 && <Stap8 onBack={() => setStap(7)} onNaarEvaluatie={() => setStap(9)} />}
        {stap === 9 && <Stap9 bedrijf={bedrijf} csvData={csvData} onBack={() => setStap(8)} />}
      </div>

            {/* ── Verdify footer logo ── */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        background: C.bgMid,
        padding: "24px 40px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 24,
      }}>
        <div style={{
          background: "#ffffff",
          borderRadius: 10,
          padding: "6px 10px",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,.4)",
          flexShrink: 0,
        }}>
          <img src={VERDIFY_LOGO} alt="Verdify" style={{ height: 64, width: "auto", objectFit: "contain", display: "block" }} />
        </div>
        <div>
          <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 22, color: C.text, letterSpacing: "-.3px", marginBottom: 4, lineHeight: 1 }}>
            Meta Ads Bureau
          </div>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: font.body, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 3 }}>
            AI-aangedreven campagne builder
          </div>
          <div style={{ fontSize: 11, color: C.goudDim, fontFamily: font.body, letterSpacing: ".5px" }}>
            Powered by Verdify · verdify.eu
          </div>
        </div>
      </div>
    </div>
  );
}
