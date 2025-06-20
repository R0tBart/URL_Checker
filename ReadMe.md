### Projekt: Multi-URL Checker Dashboard

Ein Tool zum gleichzeitigen Überprüfen vieler URLs über ein Web-Frontend. Ideal für SEO-Checks, Systemadministration oder Webmonitoring. Unterstützt Statuscode-Analyse, SSL-Validierung, Ladezeitmessung und DNS-Auflösung.

---

## 🔧 Features
- HTTP-Statuscode-Erkennung
- Ladezeit-Messung
- SSL-Zertifikats-Check (gültig oder nicht)
- Redirect-Erkennung
- DNS/IP-Auflösung
- REST API via FastAPI
- Asynchrone parallele URL-Überprüfung mit `aiohttp`

---

## 🧰 Techstack

### Backend
- **Python 3.10+**
- **FastAPI** – schnelles API-Framework
- **aiohttp** – asynchrone HTTP-Requests
- **uvicorn** – ASGI Server
- **ssl** / **socket** – Zertifikatsprüfung & IP-Auflösung

### Frontend (optional)
- HTML5 + CSS3 + Vanilla JavaScript
- Optional: Bootstrap/TailwindCSS für UI
- Optional: DataTables.js, Chart.js

---

## 📦 Installation

### 🔁 Klonen:
```bash
git clone https://github.com/dein-user/url-checker.git
cd url-checker
```

### 📦 Python-Abhängigkeiten installieren:
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install fastapi aiohttp uvicorn
```

---

## 🚀 Starten des Backends
```bash
uvicorn backend.main:app --reload
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

## 👥 Team-Aufteilung

### 🔧 Backend @ Chris:
- API-Entwicklung mit FastAPI
- asynchrone URL-Checks mit Fehlerbehandlung
- DNS/IP-Erkennung

### 🎨 Frontend @ Phil:
- UI + JS für API-Aufrufe
- Darstellung der Ergebnisse (Tabelle, Farben)
- Benutzerfeedback, Loading-Status

### 📊 Logik/Extras @ Ralf:
- Exportfunktion (CSV)
- Statuscode-Statistik
- Visualisierung mit Chart.js
- Optional: GeoIP + Screenshot

---

## 📦 Beispiel-Dateistruktur
```
url-checker/
├── backend/
│   └── main.py
├── frontend/
│   ├── index.html
│   └── script.js
├── requirements.txt
└── README.md
```

---

## 🔒 Hinweise / Sicherheit
- CORS beachten, wenn Frontend separat gehostet wird
- SSL-Checks sind limitiert bei bestimmten Redirects (z. B. HTTP → HTTPS)
- Kein Request-Timeout gesetzt – ggf. bei produktivem Einsatz ergänzen

---

## 📃 Lizenz
MIT License – kostenlos nutzbar, mit Namensnennung.
