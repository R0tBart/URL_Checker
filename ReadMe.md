![logo](./backend/images/layer8.png)


# Multi-URL Checker Dashboard

Ein Tool zum gleichzeitigen Überprüfen mehrer URLs über ein Web-Frontend. Ideal für SEO-Checks, Systemadministration oder Webmonitoring. Unterstützt Statuscode-Analyse, SSL-Validierung, Ladezeitmessung und DNS-Auflösung.

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

# 🧰 Techstack

| Bereich       | Technologie            |
|--------------|------------------------|
| Backend       | Node.js, Express, Axios |
| Frontend      | HTML, CSS, Vanilla JS |
| Datenvisual.  | Chart.js (optional)    |
| Tools         | Docker (optional)      |
---
---
# 👥 Team & Aufgaben

## 🔧 Chris – Backend-Entwicklung

- Express API mit POST `/check-urls`
- HTTP-Requests mit Axios
- SSL-, Redirect-, DNS-Checks
- Ladezeitmessung mit `perf_hooks`
- JSON-Antwort für das Frontend
--> siehe auch **readme_backend.md** für weitere Details

## 🎨 Phil – Frontend-Entwicklung

- UI mit HTML/CSS/JS
- Eingabemaske für URLs
- Fetch → `/check-urls`
- Darstellung in Tabelle mit Farbcodes
- Loading-Indikator & Fehlerhandling

## 📊 Ralf – Fullstack & Features

- CSV/PDF-Export
- Statuscode-Auswertung in Chart.js
- GeoIP (z. B. via ipinfo.io)
- Screenshotfunktion (optional mit `playwright`)
- Dockerisierung & Strukturpflege



---
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

## 📦 Dateistruktur
```
url-checker/
├── backend/
|   ├── images/
|       ├── server_laeuft.png
|       ├── server_laeuft_NICHT_test.png
|       └── server_laeuft_test.png
│   ├── index.js
│   ├── utils.js
│   ├── package.json
|   ├── readMe_BACKEND.md
│   └── .env         # optional, für Umgebungsvariablen im Moment nicht vorhanden!
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
