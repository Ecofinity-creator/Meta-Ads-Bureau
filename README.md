# 🚀 Meta Ads Bureau — Verdify
### AI-aangedreven Meta Ads campagne builder

Begeleid klanten stap voor stap van ruwe bedrijfsdata naar kant-en-klare advertentieteksten en visual prompts — aangedreven door Claude van Anthropic.

---

## 📋 Inhoud
- 7-staps campagne wizard
- AI doelgroepanalyse & micro-segmenten
- Pijnpunten analyse via klantreviews
- Segment × Pijnpunt matrix
- Campagne-insteek suggesties
- 10 advertentieteksten per combinatie (5 hook-types)
- Foto- & videoprompts (Midjourney / DALL-E / Sora)
- Ingebouwde hulpfunctie per stap
- USP & aanbod opzoeker
- HTML downloads

---

## 🛠️ Installatie & opstarten

### Vereisten
- **Node.js** ≥ 18 — download via [nodejs.org](https://nodejs.org)
- **Git** — download via [git-scm.com](https://git-scm.com)
- **Anthropic API-sleutel** — via [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

### Lokaal draaien

```bash
# 1. Clone de repository
git clone https://github.com/jouw-naam/verdify-meta-ads-bureau.git
cd verdify-meta-ads-bureau

# 2. Installeer dependencies
npm install

# 3. Stel API-sleutel in
cp .env.example .env.local
# Open .env.local en vul in: ANTHROPIC_API_KEY=sk-ant-...

# 4. Start de ontwikkelserver (Vite + Vercel functies tegelijk)
npm run dev

# 5. Open http://localhost:3000
```

---

## 🌐 Deployen op Vercel (gratis hosting)

### Eenmalige setup

```bash
# Installeer Vercel CLI (al inbegrepen als dev dependency)
npx vercel login

# Deploy
npx vercel --prod
```

### Via GitHub (aanbevolen — auto-deploy bij elke push)

1. Maak een nieuwe repository aan op [github.com/new](https://github.com/new)
2. Push de code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/jouw-naam/verdify-meta-ads-bureau.git
   git push -u origin main
   ```
3. Ga naar [vercel.com](https://vercel.com) → **Add New Project** → importeer de GitHub repo
4. Voeg de environment variable toe:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-api03-...`
5. Klik **Deploy** — klaar! 🎉

Elke `git push` naar `main` deployt automatisch.

---

## 🔑 API-sleutel beheer

| Omgeving | Sleutel instellen |
|---|---|
| Lokaal | `.env.local` bestand |
| Vercel | Dashboard → Settings → Environment Variables |
| Handmatig | Invoerveld bovenaan de app (tijdelijk, per sessie) |

---

## 🏗️ Projectstructuur

```
verdify-meta-ads-bureau/
├── src/
│   ├── App.jsx          # Volledige React applicatie (7 stappen)
│   └── main.jsx         # Entry point
├── api/
│   └── index.js         # Vercel serverless proxy naar Anthropic API
├── public/              # Statische bestanden
├── index.html           # HTML template
├── vite.config.js       # Vite configuratie + dev proxy
├── vercel.json          # Vercel routing configuratie
├── package.json
├── .env.example         # Voorbeeld environment variables
└── .gitignore
```

---

## 🔒 Veiligheid

- De Anthropic API-sleutel staat **nooit** in de frontend code
- Alle API-calls lopen via de serverless proxy (`/api`)
- De `.env.local` staat in `.gitignore` — wordt nooit naar GitHub gepusht
- Vercel environment variables zijn versleuteld

---

## 📄 Licentie

Eigendom van Verdify BV. Alle rechten voorbehouden.
