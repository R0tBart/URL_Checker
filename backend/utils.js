// Lädt Umgebungsvariablen aus der .env-Datei, damit API-Keys und Konfigurationen nicht im Quellcode stehen müssen
require('dotenv').config(); // Für Zugriff auf .env
// Importiert alle benötigten Node.js-Module für HTTP-Anfragen, DNS-Auflösung, SSL-Prüfung und Zeitmessung
const axios = require('axios');
const dns = require('dns').promises;
const tls = require('tls');
const { URL } = require('url');
const { performance } = require('perf_hooks');

// Liest den API-Key für VirusTotal aus den Umgebungsvariablen
const virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY;

// Prüft, ob eine URL von VirusTotal als gefährlich oder verdächtig eingestuft wird
// Nutzt die öffentliche API von VirusTotal, um eine Sicherheitsbewertung der URL zu erhalten
async function checkUrlVirusTotal(url) {
  try {
    // Die URL muss für die API base64-kodiert werden (ohne abschließende Gleichheitszeichen)
    const encodedUrl = Buffer.from(url).toString('base64').replace(/=+$/, '');
    const res = await axios.get(
      `https://www.virustotal.com/api/v3/urls/${encodedUrl}`,
      {
        headers: {
          'x-apikey': virusTotalApiKey
        }
      }
    );

    // Extrahiert die wichtigsten Analyse-Statistiken (z.B. wie viele Engines die URL als "malicious" melden)
    const stats = res.data.data.attributes.last_analysis_stats;
    return {
      malicious: stats.malicious, // Anzahl der Engines, die die URL als bösartig einstufen
      suspicious: stats.suspicious, // Anzahl der Engines, die die URL als verdächtig einstufen
      stats, // Alle Analyse-Statistiken
      permalink: `https://www.virustotal.com/gui/url/${encodedUrl}/detection` // Link zum vollständigen Bericht
    };
  } catch (err) {
    // Gibt bei Fehlern eine Warnung aus und gibt die Fehlermeldung zurück
    console.warn(`VirusTotal-Fehler für ${url}:`, err.message);
    return { error: err.message };
  }
}

// Löst einen Hostnamen (z.B. "example.com") in eine IP-Adresse auf
// Gibt die IP-Adresse zurück oder null, falls die Auflösung fehlschlägt
async function resolveIp(hostname) {
  try {
    const result = await dns.lookup(hostname);
    return result.address;
  } catch (err) {
    // Gibt bei Fehlern eine Warnung aus und gibt null zurück
    console.warn(`DNS-Auflösung fehlgeschlagen für ${hostname}:`, err.message);
    return null;
  }
}

// Prüft, ob für einen Host ein gültiges SSL-Zertifikat existiert
// Verbindet sich mit dem Server und prüft das Ablaufdatum des Zertifikats
function checkSslValid(hostname, port = 443) {
  return new Promise((resolve) => {
    // Timeout, falls der Server nicht rechtzeitig antwortet
    const timeout = setTimeout(() => {
      resolve(false);
    }, 5000);

    // Baut eine TLS-Verbindung auf (ohne Zertifikatsvalidierung, da wir nur das Ablaufdatum prüfen)
    const socket = tls.connect(port, hostname, {
      servername: hostname,
      rejectUnauthorized: false,
      timeout: 5000
    }, () => {
      clearTimeout(timeout);
      try {
        const cert = socket.getPeerCertificate();
        // Überprüft, ob das Zertifikat noch gültig ist (Ablaufdatum in der Zukunft)
        const valid = cert.valid_to && new Date(cert.valid_to) > new Date();
        socket.end();
        resolve(valid);
      } catch (err) {
        socket.end();
        resolve(false);
      }
    });

    // Fehler- und Timeout-Handler
    socket.on('error', () => {
      clearTimeout(timeout);
      resolve(false);
    });

    socket.on('timeout', () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve(false);
    });
  });
}

// Prüft, ob ein String eine gültige URL ist (Syntaxprüfung)
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Hauptfunktion: Prüft eine URL auf Erreichbarkeit, SSL-Gültigkeit, IP, Weiterleitung und Virenstatus
// Gibt ein umfassendes Ergebnisobjekt zurück, das alle Prüfergebnisse enthält
async function checkUrl(url) {
  if (!isValidUrl(url)) {
    // Gibt bei ungültiger URL ein Fehlerobjekt zurück
    return {
      url,
      status_code: null,
      response_time: null,
      ssl_valid: null,
      redirect: false,
      ip: null,
      virus_check: null,
      error: 'Ungültige URL'
    };
  }

  try {
    // Startzeit für Antwortzeitmessung (Millisekunden)
    const start = Date.now();
    // Sendet einen HTTP-Request (ohne Weiterleitungen zu folgen, um Redirects zu erkennen)
    const response = await axios.get(url, {
      maxRedirects: 0,
      timeout: 10000,
      validateStatus: null,
      headers: {
        'User-Agent': 'URL-Checker/1.0'
      }
    });
    const end = Date.now();

    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // Führt IP-Auflösung, SSL-Prüfung (nur bei https) und Virencheck parallel aus
    const [ip, sslValid, virusCheck] = await Promise.all([
      resolveIp(hostname),
      parsedUrl.protocol === 'https:' ? checkSslValid(hostname) : Promise.resolve(null),
      checkUrlVirusTotal(url)
    ]);

    // Gibt alle gesammelten Informationen zur URL zurück
    return {
      url,
      status_code: response.status, // HTTP-Statuscode (z.B. 200, 404, 301)
      response_time: end - start, // Antwortzeit in Millisekunden
      ssl_valid: sslValid, // true/false/null je nach SSL-Prüfung
      redirect: response.status >= 300 && response.status < 400, // true, falls Redirect
      ip, // IP-Adresse des Servers
      headers: {
        'content-type': response.headers['content-type'], // Typ der Antwort (z.B. text/html)
        'server': response.headers['server'] // Server-Software (falls vorhanden)
      },
      virus_check: virusCheck // Ergebnis des VirusTotal-Checks
    };
  } catch (err) {
    // Fehlerfall: Versucht trotzdem, IP und Virencheck zu liefern
    const parsedUrl = new URL(url);
    const ip = await resolveIp(parsedUrl.hostname).catch(() => null);
    const virusCheck = await checkUrlVirusTotal(url);

    return {
      url,
      status_code: null,
      response_time: null,
      ssl_valid: null,
      redirect: false,
      ip,
      virus_check: virusCheck,
      error: err.code || err.message // Fehlercode oder Nachricht
    };
  }
}

// Misst die Ausführungszeit einer beliebigen asynchronen Funktion
// Gibt das Ergebnis der Funktion und die gemessene Dauer in Millisekunden zurück
async function measureExecutionTime(func) {
  const start = performance.now();
  const result = await func();
  const end = performance.now();
  return { result, duration: end - start };
}

// Exportiert die Hauptfunktionen, damit sie im Server (index.js) verwendet werden können
module.exports = { checkUrl, measureExecutionTime };
