import React from "react";
import { useState, useRef, useEffect } from "react";

const VERDIFY_LOGO = "data:image/png;base64,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";

// ─── API KEY CONTEXT ─────────────────────────────────────────────────────────
// API calls go through /api proxy (Vercel function or Vite dev proxy).
// getApiKey/setApiKey kept for the optional in-browser fallback banner.

let _apiKey = (typeof sessionStorage !== "undefined" && sessionStorage.getItem("__mab_key")) || "";
function getApiKey() { return _apiKey; }
function setApiKey(k) { _apiKey = k.trim(); if (typeof sessionStorage !== "undefined") sessionStorage.setItem("__mab_key", _apiKey); }

// ─── HELPERS ────────────────────────────────────────────────────────────────

function stripJson(str) {
  return str.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
}

async function callClaude(system, userPrompt, maxTokens = 1000) {
  const key = getApiKey();
  const headers = { "Content-Type": "application/json" };
  if (key) headers["x-api-key"] = key;
  const response = await fetch("/api", {
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
    throw new Error("API fout " + response.status + ": " + (errData?.error?.message || response.statusText));
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
  .badge{display:inline-block;background:#fdf5e0;border:1.5px solid #c9a84c;color:#8a6a10;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;margin:4px;letter-spacing:.3px}
  .hook{font-size:10px;background:#1a1614;color:#c9a84c;padding:4px 12px;border-radius:6px;display:inline-block;margin-bottom:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase}
  pre{background:#f5f0e8;border:1px solid #e0d5c0;padding:18px;border-radius:10px;white-space:pre-wrap;font-size:12px;word-break:break-word;font-family:'Courier New',monospace;color:#2a2218}
  .concept{font-weight:700;color:#8a6a10;font-size:.95rem}
  .why{color:#8a7e6e;font-style:italic;font-size:.88rem;margin:6px 0}
  .opbouw{font-size:.78rem;color:#c9a84c;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
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

const STAP_NAMEN = ["Bedrijfsinfo", "Doelgroep", "Segmenten & Reviews", "Pijnpunten", "Matrix", "Campagne", "Advertenties"];

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
        kop: "Hoe exporteer je een CSV vanuit Meta Ads Manager?",
        tekst: "Stap 1: Ga naar business.facebook.com → Ads Manager\nStap 2: Klik op 'Doelgroepen' in het linker menu\nStap 3: Selecteer een bestaande doelgroep\nStap 4: Klik op 'Acties' → 'Exporteren'\nStap 5: Kies CSV-formaat en download\n\nGeen bestaande doelgroepen? Gebruik dan de handmatige beschrijving hieronder."
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
        kop: "Foto-prompts gebruiken (Midjourney / DALL-E)",
        tekst: "Kopieer de Engelse prompt en plak die in:\n• Midjourney via Discord: /imagine [prompt]\n• DALL-E via ChatGPT: gewoon plakken in het chatvenster\n• Adobe Firefly of Leonardo.ai als alternatief\n\nDe prompts zijn al geoptimaliseerd voor advertentieformaten."
      },
      {
        icon: "🎬",
        kop: "Video-prompts gebruiken (Sora / Veo 3)",
        tekst: "Kopieer de Engelse prompt en gebruik:\n• Sora via openai.com/sora\n• Veo 3 via Google Labs (beperkte toegang)\n• Runway Gen-3 als breed beschikbaar alternatief\n• Pika Labs voor snelle resultaten\n\nDe opbouw (hook → body → CTA) is al ingebakken in de prompt."
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
  goud:        "#c9a84c",
  goudLight:   "#1e1a0e",
  goudBright:  "#e2bf6a",
  goudDim:     "#8a6a10",
  bg:          "#0d0b08",
  bgMid:       "#131009",
  card:        "#1a1510",
  border:      "#2e2618",
  borderGold:  "#4a3c1a",
  text:        "#f0e8d8",
  textSoft:    "#c8bfac",
  muted:       "#7a7060",
  success:     "#4ade80",
  error:       "#f87171",
  info:        "#60a5fa",
  shadow:      "0 4px 28px rgba(0,0,0,.55)",
  shadowGold:  "0 4px 20px rgba(201,168,76,.14)",
  drawerBg:    "#110e08",
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
              <div style={{ fontFamily: font.body, fontSize: 13, color: C.textSoft, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {s.tekst}
              </div>
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
                    background: "#1a1f0e",
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
        color: hover ? C.goud : C.goudDim,
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
                border: `2px solid ${done || active ? C.goud : C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: font.display, fontWeight: 700, fontSize: 15,
                color: done ? "#1a1614" : active ? C.goud : C.muted,
                transition: "all .35s",
                boxShadow: active ? C.shadowGold : done ? "0 0 16px rgba(201,168,76,.3)" : "none",
              }}>
                {done ? "✓" : n}
              </div>
              {i < 6 && (
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
        Stap {stap} van 7 &nbsp;·&nbsp; {STAP_NAMEN[stap - 1]}
      </div>
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: "32px 36px", boxShadow: C.shadow, ...style }}>
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
    primary: { background: disabled ? C.border : `linear-gradient(135deg, ${C.goud} 0%, ${C.goudBright} 100%)`, color: disabled ? C.muted : "#1a1614", fontWeight: 700, boxShadow: disabled ? "none" : C.shadowGold },
    outline: { background: "transparent", color: C.goud, border: `1.5px solid ${C.goud}` },
    ghost: { background: C.goudLight, color: C.goud, border: `1px solid ${C.borderGold}` },
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
      <h3 style={{ fontFamily: font.display, fontWeight: 600, fontSize: 20, color: C.text, margin: 0, letterSpacing: "-.3px" }}>{title}</h3>
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
          <h2 style={{ fontFamily: font.display, fontWeight: 700, fontSize: 26, margin: 0, color: C.text, letterSpacing: "-.5px", lineHeight: 1.1 }}>{title}</h2>
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
    setLoading(true); setGegenereerd(true);
    try {
      const sectorHint = (naam + " " + url).toLowerCase();
      const sector = sectorHint.includes("eco") || sectorHint.includes("green") || sectorHint.includes("finity") || sectorHint.includes("duurzaam") || sectorHint.includes("energy") ? "duurzaamheid en energie"
        : sectorHint.includes("tech") || sectorHint.includes("soft") || sectorHint.includes("app") || sectorHint.includes("dev") || sectorHint.includes("ify") || sectorHint.includes("digit") ? "software en technologie"
        : sectorHint.includes("bouw") || sectorHint.includes("construct") ? "bouw en infrastructuur"
        : sectorHint.includes("consult") || sectorHint.includes("advies") ? "consultancy"
        : "professionele dienstverlening";
      const sysprompt = "Je bent een marketing expert. Geef output ALLEEN als JSON, geen uitleg.";
      const userprompt = "Genereer 6 sterke USPs voor " + naam + (url ? " (" + url + ")" : "") + " in de sector " + sector + ". Hoe communiceert dit bedrijf op LinkedIn en Facebook? Verwerk die inzichten. Output: JSON met sector, samenvatting (2 zinnen), usps (array van 6 max-10-woorden strings), bronnen (leeg array).";
      const _hdr = { "Content-Type": "application/json" };
      const _k = getApiKey(); if (_k) _hdr["x-api-key"] = _k;
      const resp = await fetch("/api", {
        method: "POST",
        headers: _hdr,
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: sysprompt, messages: [{ role: "user", content: userprompt }] }),
      });
      const data = await resp.json();
      const raw = (data.content || []).map(c => c.text || "").join("");
      setUspFout("Verbindingsfout: " + (e.message || "onbekende fout"));
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
      background: "#111a12",
      border: `1px solid #2a4a2e`,
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
                      flex: 1, background: "#0d1a10", border: "1.5px solid #4ade80",
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
      const _hdr2 = { "Content-Type": "application/json" };
      const _k2 = getApiKey(); if (_k2) _hdr2["x-api-key"] = _k2;
      const resp = await fetch("/api", {
        method: "POST",
        headers: _hdr2,
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
      background: "#0e1520",
      border: "1px solid #1e3050",
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
                  background: "#0a1018", border: "1.5px solid #60a5fa",
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

function Stap2({ bedrijf, onNext, onHelp }) {
  const [csvText, setCsvText] = useState("");
  const [handmatig, setHandmatig] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setCsvText(ev.target.result);
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
      onMouseEnter={e => e.currentTarget.style.borderColor = C.borderGold}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
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
  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonEdit, setJsonEdit] = useState(JSON.stringify(segmenten, null, 2));
  const [jsonErr, setJsonErr] = useState("");
  const [loading, setLoading] = useState(false);

  const applyJson = () => {
    try { setSegmenten(JSON.parse(jsonEdit)); setJsonErr(""); setJsonOpen(false); }
    catch (e) { setJsonErr("Ongeldige JSON: " + e.message); }
  };

  const analyseer = async () => {
    setLoading(true);
    try {
      const raw = await callClaude(
        "Je bent copywriting expert. Geef output ALLEEN als JSON array van 10 strings, geen uitleg.",
        `Analyseer reviews voor "${bedrijf.naam}". Reviews: ${reviews || "(geen reviews)"}.\nGeef 10 impactvolle pijnpunten als herkenbare zinnen vanuit de klant.\nJSON: ["pijnpunt 1", "pijnpunt 2", ...]`,
        800
      );
      const parsed = parseJsonSafe(raw, FALLBACK_PIJNPUNTEN);
      onNext(Array.isArray(parsed) ? parsed : FALLBACK_PIJNPUNTEN);
    } catch { onNext(FALLBACK_PIJNPUNTEN); }
    finally { setLoading(false); }
  };

  return (
    <Card>
      <StepTitle emoji="👥" title="Jouw 4 micro-segmenten"
        sub="AI heeft deze segmenten gegenereerd. Pas aan indien nodig, voeg reviews toe."
        onHelp={onHelp} heeftNaam={!!bedrijf.naam} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        {segmenten.map(s => <SegmentKaart key={s.id} seg={s} />)}
      </div>
      <div style={{ marginBottom: 24 }}>
        <Btn variant="ghost" onClick={() => setJsonOpen(!jsonOpen)} small>{jsonOpen ? "▲ JSON verbergen" : "▼ JSON aanpassen"}</Btn>
        {jsonOpen && (
          <div style={{ marginTop: 12 }}>
            <textarea value={jsonEdit} onChange={e => setJsonEdit(e.target.value)} rows={10}
              style={{ width: "100%", boxSizing: "border-box", padding: 14, borderRadius: 10, border: `1px solid ${jsonErr ? C.error : C.border}`, fontFamily: "monospace", fontSize: 12, background: C.bgMid, color: C.textSoft, resize: "vertical" }} />
            {jsonErr && <div style={{ color: C.error, fontSize: 12, marginTop: 4 }}>{jsonErr}</div>}
            <Btn onClick={applyJson} small style={{ marginTop: 8 }}>Toepassen</Btn>
          </div>
        )}
      </div>
      <Textarea label="Klantreviews of feedback (optioneel)" value={reviews} onChange={setReviews}
        placeholder="Plak hier klantreviews, testimonials of feedback. AI destilleert de pijnpunten…" rows={5} />
      {loading ? <Loader text="Pijnpunten analyseren…" /> : <Btn onClick={analyseer}>Analyseer pijnpunten →</Btn>}
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
              {gekozenPijnpunten.map(pi => (
                <th key={pi} style={{ padding: "12px 10px", fontSize: 11, fontFamily: font.body, color: C.muted, borderBottom: `1px solid ${C.border}`, textAlign: "center", fontWeight: 600 }}>{afkorten(pijnpunten[pi])}</th>
              ))}
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

  const samenvatting = combinaties.map(k => {
    const [sId, pIdx] = k.split("_");
    const seg = segmenten.find(s => String(s.id) === sId);
    const pp = pijnpunten[parseInt(pIdx)];
    return seg && pp ? `${seg.naam}: "${pp}"` : k;
  }).join(" | ");

  const genereer = async () => {
    setLoading(true); setAiGegenereerd(true);
    try {
      const raw = await callClaude(
        "Je bent Meta Ads strateeg. Geef output ALLEEN als JSON array.",
        `Geef 4 campagne-insteken voor "${bedrijf.naam}" met aanbod "${bedrijf.aanbod}" en combinaties: ${samenvatting}.\nJSON: [{"type":"...","omschrijving":"...","doel":"Leads","moeilijkheid":"Middel"}]\nKies uit: Gratis Webinar, E-book/PDF Download, Online Challenge, Quiz-funnel, Directe Verkoop, Winactie, Gratis Consult/Demo, Brochure Download.`,
        600
      );
      const parsed = parseJsonSafe(raw, []);
      setSuggesties(Array.isArray(parsed) ? parsed : []);
    } catch { setSuggesties([]); }
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
      {!aiGegenereerd && (
        <div style={{ marginBottom: 24 }}>
          {loading ? <Loader text="AI-suggesties ophalen…" /> : <Btn onClick={genereer}>✨ Genereer AI-suggesties</Btn>}
        </div>
      )}
      {loading && aiGegenereerd && <div style={{ marginBottom: 24 }}><Loader text="AI-suggesties ophalen…" /></div>}
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
      const raw = await callClaude(
        "Je bent top Meta Ads copywriter. Schrijf in het Nederlands. Geef output ALLEEN als JSON object, geen uitleg, geen markdown.",
        `Schrijf 10 advertentieteksten + 10 kopteksten voor Meta Ads.
Bedrijf: ${bedrijf.naam} | Website: ${bedrijf.url || "N/A"} | Aanbod: ${bedrijf.aanbod}
Campagne: ${campagne}
Segment: ${seg.naam} (${seg.leeftijd}, ${seg.geslacht}, ${seg.kenmerken})
Pijnpunt: "${pijnpunt}"
STRUCTUUR ELKE TEKST:
1. Sterke HOOK (scrollstopper via herkenning pijnpunt)
2. Ombuigen naar interesse in oplossing
3. Verlangen creëren + USP's puntsgewijs
4. Verleidelijke CTA passend bij de campagne-insteek
HOOK VARIATIES (2 teksten per type):
Hook 1: Emotioneel, Hook 2: Rationeel, Hook 3: Direct probleem, Hook 4: Urgentie, Hook 5: Droom
JSON: {"teksten":[{"hook_type":"Emotioneel","tekst":"volledige advertentietekst…"}],"kopteksten":["koptekst 1",...]}`,
        2500
      );
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
                  <p style={{ fontFamily: font.body, fontSize: 14, lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap", color: C.textSoft }}>{t.tekst ?? ""}</p>
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

function Stap7({ bedrijf, segmenten, pijnpunten, combinaties, campagne, onBack, onHelp }) {
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
      </div>
    </div>
  );
}


// ─── API KEY BANNER ──────────────────────────────────────────────────────────

function ApiKeyBanner() {
  const [key, setKey] = useState(getApiKey());
  const [visible, setVisible] = useState(!getApiKey());
  const [saved, setSaved] = useState(!!getApiKey());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const opslaan = async () => {
    if (!key.trim()) return;
    setApiKey(key.trim());
    setSaved(true);
    setTesting(true);
    setTestResult(null);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key.trim(), "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 10, system: "Reply ok.", messages: [{ role: "user", content: "ping" }] }),
      });
      const d = await r.json();
      if (d.content) { setTestResult("ok"); setTimeout(() => setVisible(false), 1200); }
      else setTestResult("fout: " + (d.error?.message || "ongeldige sleutel"));
    } catch (e) { setTestResult("fout: " + e.message); }
    finally { setTesting(false); }
  };

  const wijzigen = () => { setVisible(true); setSaved(false); setTestResult(null); };

  if (!visible && saved) {
    return (
      <div style={{
        background: "#0d1a10", borderBottom: "1px solid #1e3a20",
        padding: "8px 28px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#4ade80", fontSize: 13 }}>✓</span>
          <span style={{ color: "#4ade80", fontFamily: font.body, fontSize: 12, fontWeight: 600 }}>
            API-sleutel actief
          </span>
          <span style={{ color: "#2a4a2e", fontFamily: "monospace", fontSize: 11 }}>
            sk-ant-···{key.slice(-6)}
          </span>
        </div>
        <button onClick={wijzigen} style={{
          background: "transparent", border: "1px solid #1e3a20", borderRadius: 6,
          color: "#2d6b35", fontSize: 11, cursor: "pointer", padding: "3px 10px",
          fontFamily: font.body,
        }}>Wijzigen</button>
      </div>
    );
  }

  return (
    <div style={{
      background: "#0a1a0e",
      borderBottom: `2px solid ${testResult === "ok" ? "#4ade80" : testResult ? "#f87171" : "#1e3a20"}`,
      padding: "14px 28px",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}>🔑</span>
          <div>
            <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15, color: C.text }}>
              Anthropic API-sleutel vereist
            </div>
            <div style={{ fontSize: 12, color: C.muted, fontFamily: font.body }}>
              Haal je sleutel op via{" "}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener"
                style={{ color: "#4ade80", textDecoration: "none" }}>
                console.anthropic.com/settings/keys
              </a>
              {" "}— begint met <code style={{ background: "#1a2a1a", padding: "1px 5px", borderRadius: 3, fontSize: 11 }}>sk-ant-</code>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="password"
            value={key}
            onChange={e => { setKey(e.target.value); setSaved(false); setTestResult(null); }}
            onKeyDown={e => e.key === "Enter" && opslaan()}
            placeholder="sk-ant-api03-..."
            style={{
              flex: 1, minWidth: 260, padding: "10px 14px", borderRadius: 9,
              border: `1.5px solid ${testResult === "ok" ? "#4ade80" : testResult ? "#f87171" : "#1e3a20"}`,
              background: "#0d1a10", color: C.text, fontFamily: "monospace", fontSize: 13,
              outline: "none",
            }}
          />
          <button
            onClick={opslaan}
            disabled={!key.trim() || testing}
            style={{
              background: key.trim() && !testing ? "linear-gradient(135deg,#2d7a3a,#4ade80)" : "#1a2a1a",
              border: "none", borderRadius: 9, padding: "10px 20px",
              color: key.trim() && !testing ? "#111a12" : C.muted,
              fontFamily: font.body, fontWeight: 700, fontSize: 13,
              cursor: key.trim() && !testing ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {testing ? (
              <><span style={{ width: 12, height: 12, border: "2px solid #1a4a22", borderTop: "2px solid #4ade80", borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block" }} /> Testen...</>
            ) : "Opslaan & testen"}
          </button>
          {testResult && (
            <span style={{
              fontFamily: font.body, fontSize: 13, fontWeight: 600,
              color: testResult === "ok" ? "#4ade80" : "#f87171",
            }}>
              {testResult === "ok" ? "✓ Verbinding geslaagd!" : "✗ " + testResult}
            </span>
          )}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "#2a4a2e", fontFamily: font.body }}>
          Je sleutel wordt enkel lokaal opgeslagen (sessionStorage) en nooit verstuurd naar andere servers dan api.anthropic.com.
        </div>
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
      <div style={{ background: "linear-gradient(90deg, #0d1a10 0%, #131009 40%)", borderBottom: `1px solid ${C.border}`, padding: "0 28px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 32px rgba(0,0,0,.5)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div style={{
              background: "#ffffff",
              borderRadius: 10,
              padding: "6px 14px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 16px rgba(0,0,0,.4), 0 0 0 1px rgba(255,255,255,.08)",
            }}>
              <img
                src={VERDIFY_LOGO}
                alt="Verdify"
                style={{ height: 36, width: "auto", objectFit: "contain", display: "block" }}
              />
            </div>
            <div style={{ width: 1, height: 32, background: C.borderGold, margin: "0 18px" }} />
            <div>
              <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 17, color: C.text, lineHeight: 1, letterSpacing: "-.3px" }}>Meta Ads Bureau</div>
              <div style={{ fontSize: 10, color: C.goudDim, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" }}>AI Campagne Builder</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {bedrijf.naam && (
              <div style={{ background: C.goudLight, border: `1px solid ${C.borderGold}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, color: C.goud, fontFamily: font.body }}>
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
        {stap === 2 && <Stap2 bedrijf={bedrijf} onNext={segs => { setSegmenten(segs); setStap(3); }} onHelp={() => setHelpOpen(true)} />}
        {stap === 3 && <Stap3 bedrijf={bedrijf} segmenten={segmenten} setSegmenten={setSegmenten} onNext={pp => { setPijnpunten(pp); setStap(4); }} onHelp={() => setHelpOpen(true)} />}
        {stap === 4 && <Stap4 pijnpunten={pijnpunten} gekozen={gekozenPijnpunten} setGekozen={setGekozenPijnpunten} onNext={() => setStap(5)} bedrijf={bedrijf} onHelp={() => setHelpOpen(true)} />}
        {stap === 5 && <Stap5 segmenten={segmenten} pijnpunten={pijnpunten} gekozenPijnpunten={gekozenPijnpunten} combinaties={combinaties} setCombinaties={setCombinaties} onNext={() => setStap(6)} bedrijf={bedrijf} onHelp={() => setHelpOpen(true)} />}
        {stap === 6 && <Stap6 bedrijf={bedrijf} combinaties={combinaties} segmenten={segmenten} pijnpunten={pijnpunten} onNext={c => { setCampagne(c); setStap(7); }} onBack={() => setStap(5)} onHelp={() => setHelpOpen(true)} />}
        {stap === 7 && <Stap7 bedrijf={bedrijf} segmenten={segmenten} pijnpunten={pijnpunten} combinaties={combinaties} campagne={campagne} onBack={() => setStap(6)} onHelp={() => setHelpOpen(true)} />}
      </div>
    </div>
  );
}
