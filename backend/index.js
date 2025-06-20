const express = require('express');
const { checkUrl } = require('./utils');

// Express-Anwendung initialisieren
const app = express();
// Port für den Server, Standard ist 8000
const PORT = process.env.PORT || 8000;

// CORS-Middleware hinzufügen
// Ermöglicht Cross-Origin-Anfragen vom Frontend
app.use((req, res, next) => {
  // Erlaubt Anfragen von jeder Origin (*)
  res.header('Access-Control-Allow-Origin', '*');
  // Erlaubt spezifische HTTP-Methoden
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // Erlaubt spezifische Header in den Anfragen
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Behandelt OPTIONS-Anfragen (Preflight-Anfragen für CORS)
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    // Fährt mit der nächsten Middleware fort
    next();
  }
});

// Middleware zum Parsen von JSON-Anfragekörpern
app.use(express.json());

// Gesundheitscheck-Endpunkt
// Gibt den Status des Servers zurück
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// POST-Endpunkt für URL-Prüfungen
// Verarbeitet eine Liste von URLs und gibt deren Prüfergebnisse zurück
app.post('/check-urls', async (req, res) => {
  try {
    const { urls } = req.body;

    // Eingabekontrolle: Überprüfen, ob 'urls' vorhanden und ein Array ist
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'Bitte sende ein Feld "urls" mit einer Array von URLs.' });
    }

    // Eingabekontrolle: Überprüfen, ob die URL-Liste leer ist
    if (urls.length === 0) {
      return res.status(400).json({ error: 'Die URL-Liste darf nicht leer sein.' });
    }

    // Eingabekontrolle: Begrenzung der Anzahl der URLs pro Anfrage
    if (urls.length > 50) {
      return res.status(400).json({ error: 'Maximal 50 URLs pro Anfrage erlaubt.' });
    }

    // Alle URLs gleichzeitig verarbeiten und Ergebnisse sammeln
    const results = await Promise.all(urls.map(url => checkUrl(url)));

    // Ergebnisse und Anzahl der verarbeiteten URLs zurückgeben
    res.json({ results, count: results.length });
  } catch (error) {
    // Fehler bei der Verarbeitung der URLs loggen und 500er-Status zurückgeben
    console.error('Fehler beim Verarbeiten der URLs:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
  console.log(`📊 Gesundheitscheck: http://localhost:${PORT}/health`);
});

// Fehlerbehandlung für unbekannte Routen (404 Not Found)
// Diese Middleware wird ausgeführt, wenn keine der vorherigen Routen übereinstimmt
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpunkt nicht gefunden' });
});

// Globale Fehlerbehandlung
// Fängt alle unbehandelten Fehler in der Anwendung ab
app.use((error, req, res, next) => {
  console.error('Unbehandelter Fehler:', error);
  res.status(500).json({ error: 'Interner Serverfehler' });
});

// Graceful shutdown: Behandelt SIGTERM-Signal (z.B. von Docker oder Prozessmanagern)
// Stellt sicher, dass der Server sauber beendet wird
process.on('SIGTERM', () => {
  console.log('Server wird heruntergefahren...');
  process.exit(0);
});
