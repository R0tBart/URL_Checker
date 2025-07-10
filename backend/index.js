// ===============================
// Express-Backend für den URL-Checker
// Dieses Backend stellt die API-Endpunkte bereit, um URLs zu prüfen und Ergebnisse an das Frontend zu liefern.
// ===============================

// Importiert das Express-Framework für die Erstellung des Webservers
// und die Hilfsfunktion checkUrl aus der utils.js für die URL-Prüfung
const express = require('express');
const { checkUrl, getStats, exportCsv, getGeoIp, takeScreenshot } = require('./utils');
const path = require('path');

const app = express();
// Bestimmt den Port, auf dem der Server läuft (aus Umgebungsvariablen oder Standard 8000)
const PORT = process.env.PORT || 8000;

// ===============================
// CORS-Middleware: Erlaubt Anfragen von beliebigen Domains (z.B. vom Frontend)
// Dies ist wichtig, damit das Frontend im Browser mit dem Backend kommunizieren kann
// ===============================
app.use((req, res, next) => { 
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    // Preflight-Request für CORS: Sofort mit 200 antworten
    res.sendStatus(200);
  } else {
    next();
  }
});

// ===============================
// Middleware: Aktiviert das automatische Parsen von JSON-Daten im Request-Body
// ===============================
app.use(express.json());

// Statische Dateien aus dem Public-Ordner ausliefern
app.use(express.static(path.join(__dirname, 'public')));

// Fallback: index.html für Single-Page-Apps (optional, falls Routing im Frontend)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ===============================
// Gesundheitscheck-Endpunkt
// Gibt immer ein OK und einen Zeitstempel zurück, um zu prüfen, ob der Server läuft
// ===============================
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===============================
// Haupt-Endpunkt: Prüft eine Liste von URLs, die im Request-Body gesendet werden
// Erwartet ein JSON-Objekt mit einem Array-Feld "urls"
// Validiert die Eingabe und gibt für jede URL ein Ergebnisobjekt zurück
// ===============================
app.post('/check-urls', async (req, res) => {
  try {
    const { urls } = req.body;

    // Validierung: Prüft, ob das Feld "urls" existiert und ein Array ist
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'Bitte sende ein Feld "urls" mit einer Array von URLs.' });
    }

    // Validierung: Array darf nicht leer sein
    if (urls.length === 0) {
      return res.status(400).json({ error: 'Die URL-Liste darf nicht leer sein.' });
    }

    // Validierung: Maximal 50 URLs pro Anfrage erlaubt, um Serverlast zu begrenzen
    if (urls.length > 50) {
      return res.status(400).json({ error: 'Maximal 50 URLs pro Anfrage erlaubt.' });
    }

    // Prüft alle URLs parallel mit der checkUrl-Funktion aus utils.js
    // Die Ergebnisse werden als Array zurückgegeben
    const results = await Promise.all(urls.map(url => checkUrl(url)));

    // Antwort enthält alle Ergebnisse und die Anzahl der geprüften URLs
    res.json({ results, count: results.length });
  } catch (error) {
    // Fehlerbehandlung: Gibt bei unerwarteten Fehlern einen Serverfehler zurück
    console.error('Fehler beim Verarbeiten der URLs:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
})

// Zusatz-Endpunkt: Gibt Statuscode-Auswertung & Metriken zurück (für Chart.js)
app.get('/stats', async (req, res) => {
  const stats = await getStats();
  res.json(stats);
});

// Export-Endpunkt für CSV-Datei
app.get('/export', async (req, res) => {
  const csv = await exportCsv();
  res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});

// GeoIP-Abfrage zu einer IP-Adresse
app.get('/geoip/:ip', async (req, res) => {
  const geo = await getGeoIp(req.params.ip);
  res.json(geo);
});

// Screenshot-Erzeugung (z. B. via Playwright, optional)
app.get('/screenshot', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL fehlt in Query' });
  const filepath = await takeScreenshot(url, 'screenshot');
  if (filepath) {
    res.download(filepath);
  } else {
    res.status(500).json({ error: 'Screenshot fehlgeschlagen' });
  }
});

// Starte den Server nur, wenn die Datei direkt ausgeführt wird
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
    console.log(`📊 Gesundheitscheck: http://localhost:${PORT}/health`);
  });
}

module.exports = app;