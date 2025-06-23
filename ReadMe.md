![logo](./backend/images/layer8.png)

# URL-Checker Dashboard

Ein modernes Tool zum gleichzeitigen Überprüfen vieler URLs über ein Web-Frontend. Ideal für SEO-Checks, Systemadministration oder Webmonitoring. Unterstützt Statuscode-Analyse, SSL-Validierung, Ladezeitmessung, DNS-Auflösung **und VirusTotal-Sicherheitscheck**.

---

## 🚀 Features
- HTTP-Statuscode-Erkennung
- Ladezeit-Messung
- SSL-Zertifikats-Check (gültig oder nicht)
- Redirect-Erkennung
- DNS/IP-Auflösung
- **VirusTotal-Integration** (Gefahren-Check)
- REST API via Express (Node.js)
- Parallele URL-Überprüfung mit Axios
- CSV-Export (Frontend)

---

## 🧰 Techstack
| Bereich       | Technologie            |
|--------------|------------------------|
| Backend      | Node.js, Express, Axios, dotenv |
| Frontend     | HTML, CSS, Vanilla JS, Bootstrap |
| Tools        | Jest, Supertest, PowerShell, Docker (optional) |

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

## 📦 Installation & Start

### 1. Repository klonen
```bash
git clone https://github.com/dein-user/url-checker.git
cd url-checker/backend
```

### 2. Node.js-Abhängigkeiten installieren
```bash
npm install
```

### 3. .env-Datei anlegen (für VirusTotal)
Im Ordner `backend`:
```
VIRUSTOTAL_API_KEY=dein_api_key
```

### 4. Backend starten
```bash
npm run dev
```
API erreichbar unter: `http://localhost:8000/check-urls`

---

## 🌐 Frontend nutzen
- Öffne `frontend/index.html` im Browser (am besten über lokalen Webserver, z.B. VSCode Live Server)
- URLs eintragen (eine pro Zeile), auf **Prüfen** klicken
- Ergebnisse werden übersichtlich angezeigt und können als CSV exportiert werden

---

## 📬 Beispiel-Request (POST `/check-urls`)

**JSON Input:**
```json
{
  "urls": [
    "https://example.com",
    "http://google.com"
  ]
}
```

**JSON Response:**
```json
{
  "count": 2,
  "results": [
    {
      "url": "https://example.com",
      "status_code": 200,
      "response_time": 142,
      "ssl_valid": true,
      "redirect": false,
      "ip": "93.184.216.34",
      "headers": { "content-type": "text/html" },
      "virus_check": {
        "malicious": 0,
        "suspicious": 0,
        "permalink": "https://www.virustotal.com/gui/url/..."
      }
    },
    ...
  ]
}
```

---

## 🧪 Testen

### PowerShell-Testskript
Im Hauptverzeichnis findest du ein Beispielskript `test_api.ps1`, das die API automatisch testet.

### Automatisierte Tests (Jest)
Im Backend-Ordner:
```bash
npm test
```
Die Tests prüfen die wichtigsten API-Funktionen und Fehlerfälle.

---

## 📦 Dateistruktur
```
url-checker/
├── backend/
│   ├── images/
│   ├── index.js
│   ├── utils.js
│   ├── package.json
│   ├── readMe_BACKEND.md
│   └── .env         # für Umgebungsvariablen (API-Key)
├── frontend/
│   ├── index.html
│   ├── scripts.js
│   └── style.css
├── test_api.ps1
└── README.md
```

---

## 🔒 Hinweise / Sicherheit
- CORS ist aktiviert, damit das Frontend überall genutzt werden kann
- SSL-Checks sind limitiert bei bestimmten Redirects (z. B. HTTP → HTTPS)
- Request-Timeout ist gesetzt (10 Sekunden) – ggf. anpassen
- API-Ratelimit bei öffentlichem Hosting bedenken (insbesondere VirusTotal)
- `.env`-Datei ist in `.gitignore` eingetragen

---

## 📃 Lizenz
MIT License – kostenlos nutzbar, mit Namensnennung.

