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

### 🔧 Chris – Backend-Entwicklung
**Ziel:** Eine stabile, asynchrone REST API zur URL-Prüfung

#### Aufgaben im Detail:
- FastAPI-Grundgerüst mit `/check-urls`-Route implementieren
- Empfang der URL-Liste über POST und Validierung mit `pydantic`
- Parallele Verarbeitung mit `asyncio.gather()`
- `aiohttp`-GET-Requests mit SSL-Validierung und Timeout absichern
- DNS/IP-Auflösung mit `socket.gethostbyname()` integrieren
- Fehlerbehandlung für ungültige URLs, DNS-Fehler, SSL-Fehler
- Statuscode, Ladezeit und Redirect-Erkennung zurückgeben
- Rückgabe als standardisierte JSON-Liste
- (Optional) Logging bei Fehlern einbauen
- (Optional) Unit-Tests mit `pytest` schreiben

### 🎨 Phil – Frontend-Entwicklung
**Ziel:** Einfache, funktionale UI zum Prüfen und Anzeigen der Ergebnisse

#### Aufgaben im Detail:
- HTML-Formular mit Textarea für URL-Eingabe
- Button „Check starten“ mit JS-Eventlistener
- `fetch()`-POST an `/check-urls` mit JSON-Body
- Ergebnisse auslesen und in HTML-Tabelle darstellen
- Farbcode für Status (200 = grün, 400/500 = rot, 3xx = gelb)
- Loading-Symbol während der Anfrage einblenden
- Validierung der Eingabe (z. B. leere Felder)
- (Optional) responsives Layout mit Bootstrap oder Tailwind
- (Optional) Fehlermeldungen bei API-Ausfällen darstellen

### 📊 Ralf – Logik & Extras
**Ziel:** Erweiterte Funktionalität und Analyse

#### Aufgaben im Detail:
- Exportfunktion (CSV-Export) implementieren
- Statistikmodul: Gesamtanzahl, wie viele OK, wie viele Redirects/Fehler
- Balkendiagramm zur Statuscode-Verteilung mit Chart.js
- (Optional) GeoIP-Lokalisierung per externem API (z. B. ipinfo.io)
- (Optional) Screenshot-Funktion vorbereiten mit `playwright`
- Performanceoptimierung (z. B. Ergebnis-Caching für Duplikate)

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
- API-Ratelimit bei öffentlichem Hosting bedenken

---

## 📃 Lizenz
MIT License – kostenlos nutzbar, mit Namensnennung.
