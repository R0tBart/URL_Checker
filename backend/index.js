// backend/index.js
const express = require('express');
const { checkUrl } = require('./utils');

const app = express();
const PORT = 8000;

// Mittelware zum Parsen von JSON
app.use(express.json());

// POST-Endpunkt für URL-Prüfungen
app.post('/check-urls', async (req, res) => {
  const { urls } = req.body;

  // 🛑 Eingabekontrolle
  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'Bitte sende ein Feld "urls" mit einer Array von URLs.' });
  }

  // Alle URLs gleichzeitig verarbeiten
  const results = await Promise.all(urls.map(url => checkUrl(url)));

  res.json(results);
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
