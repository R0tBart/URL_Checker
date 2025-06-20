# Multi-URL Checker Dashboard

Ein Tool zum gleichzeitigen Überprüfen vieler URLs über ein Web-Frontend. Ideal für SEO-Checks, Systemadministration oder Webmonitoring. Unterstützt Statuscode-Analyse, SSL-Validierung, Ladezeitmessung und DNS-Auflösung.

---

## 🔧 Features
- HTTP-Statuscode-Erkennung
- Ladezeit-Messung
- SSL-Zertifikats-Check (gültig oder nicht)
- Redirect-Erkennung
- DNS/IP-Auflösung
- REST API via Express (Node.js)
- Parallele URL-Überprüfung mit Axios

---

## 🧰 Techstack

### Backend ( Chris )
- **Node.js 18+ (getestet mit Node.js 24)**
- **Express** – schnelles API-Framework
- **Axios 1.5.1** – HTTP-Requests
- **dns/tls** (Node.js built-in) – Zertifikatsprüfung & IP-Auflösung
- **dotenv** – Umgebungsvariablen

### Frontend ( Phil )
- HTML5 + CSS3 + Vanilla JavaScript
- Optional: Bootstrap/TailwindCSS für UI
- Optional: DataTables.js, Chart.js

### 📦 Test-API ( Ralf )


---

## 📦 Installation

### 🔁 Klonen:
```bash
git clone https://github.com/dein-user/url-checker.git
cd url-checker/backend
```

### 📦 Node.js-Abhängigkeiten installieren:
```bash
npm install
```

---

## 🚀 Starten des Backends
```bash
npm run dev
```
Die API ist dann erreichbar unter: `http://localhost:8000/check-urls`

---

## 📬 Beispiel-Request (POST `/check-urls`)

### JSON Input:
```json
{
  "urls": [
    "https://example.com",
    "http://google.com"
  ]
}
```

### JSON Response:
```json
[
  {
    "url": "https://example.com",
    "status_code": 200,
    "response_time": 142,
    "ssl_valid": true,
    "redirect": false,
    "ip": "93.184.216.34"
  },
  ...
]
```

---

## 🧪 Test-Frontend (optional)
1. `frontend/index.html` im Browser öffnen
2. URLs einfügen, auf „Check starten“ klicken
3. Ergebnisse in Tabelle anzeigen

---

## 📦 Beispiel-Dateistruktur
```
url-checker/
├── backend/
│   ├── index.js
│   ├── utils.js
│   ├── package.json
│   └── .env         # optional, für Umgebungsvariablen
├── frontend/
│   ├── index.html
│   └── scripts.js
└── README.md
```

---

## 🔒 Hinweise / Sicherheit
- CORS beachten, wenn Frontend separat gehostet wird (Express-Konfiguration ggf. anpassen)
- SSL-Checks sind limitiert bei bestimmten Redirects (z. B. HTTP → HTTPS)
- Request-Timeout ist gesetzt (5 Sekunden) – ggf. anpassen
- API-Ratelimit bei öffentlichem Hosting bedenken
- `.env`-Datei ist in `.gitignore` eingetragen

---

## 📃 Lizenz
MIT License – kostenlos nutzbar, mit Namensnennung.
