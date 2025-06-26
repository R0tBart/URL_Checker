// ===============================
// Hilfsfunktionen für den URL-Checker (utils.js)
// Diese Datei enthält alle zentralen Prüf- und Analysefunktionen für URLs.
// ===============================

// Lädt Umgebungsvariablen aus der .env-Datei, damit API-Keys und Konfigurationen nicht im Quellcode stehen müssen

require('dotenv').config(); // Für Zugriff auf .env

// Importiert alle benötigten Node.js-Module für HTTP-Anfragen, DNS-Auflösung, SSL-Prüfung und Zeitmessung
const axios = require('axios'); // Für HTTP-Anfragen, wie z.B. GET- und POST-Anfragen
const dns = require('dns').promises; // Für DNS-Auflösung, um die IP-Adresse einer Domain zu ermitteln
const tls = require('tls'); // Für SSL-Prüfung, um die Gültigkeit von SSL-Zertifikaten zu überprüfen
const { URL } = require('url'); // Für die Analyse von URLs und deren Komponenten 
const { performance } = require('perf_hooks'); // Für Zeitmessung, um die Ausführungszeit von Funktionen zu messen 
const fs = require('fs'); // Für Dateioperationen, wie z.B. das Lesen von Dateien 
const path = require('path'); // Für das Arbeiten mit Dateipfaden und -namen
const { chromium } = require('playwright'); // Für das automatisierte Browser testen und die Analyse von Webseiten

// Liest den API-Key für VirusTotal aus den Umgebungsvariablen
const virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY; // API-Key für VirusTotal


// ===============================
// Prüft, ob eine URL von VirusTotal als gefährlich oder verdächtig eingestuft wird
// Nutzt die öffentliche API von VirusTotal, um eine Sicherheitsbewertung der URL zu erhalten
// Rückgabe: Objekt mit Analyse-Statistiken, Link zum Bericht oder Fehler
// ===============================

async function checkUrlVirusTotal(url) { 
  try {
    const encodedUrl = Buffer.from(url).toString('base64').replace(/=+$/, '');
    const res = await axios.get(`https://www.virustotal.com/api/v3/urls/${encodedUrl}`, { // API-Anfrage an VirusTotal
      headers: { 'x-apikey': virusTotalApiKey } 
    });
    const stats = res.data.data.attributes.last_analysis_stats; // Auswertung der letzten Sicherheitsprüfungen
    return {
      malicious: stats.malicious,
      suspicious: stats.suspicious,
      stats,
      permalink: `https://www.virustotal.com/gui/url/${encodedUrl}/detection` 
    };
  } catch (err) { // Fehlerbehandlung für Fälle, in denen die API-Anfrage fehlschlägt
    console.warn(`VirusTotal-Fehler für ${url}:`, err.message);
    return { error: err.message }; // Fehlermeldung, falls die API-Anfrage fehlschlägt
  }
}

// ===============================
// Löst einen Hostnamen (z.B. "example.com") in eine IP-Adresse auf
// Gibt die IP-Adresse zurück oder null, falls die Auflösung fehlschlägt
// ===============================

async function resolveIp(hostname) {
  try {
    const result = await dns.lookup(hostname);
    return result.address;
  } catch (err) {
    console.warn(`DNS-Auflösung fehlgeschlagen für ${hostname}:`, err.message);
    return null;
  }
}


// ===============================
// Prüft, ob für einen Host ein gültiges SSL-Zertifikat existiert
// Verbindet sich mit dem Server und prüft das Ablaufdatum des Zertifikats
// Rückgabe: true (gültig), false (ungültig), null (nicht geprüft)
// ===============================

function checkSslValid(hostname, port = 443) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), 5000);
    const socket = tls.connect(port, hostname, {
      servername: hostname,
      rejectUnauthorized: false,
      timeout: 5000
    }, () => {
      clearTimeout(timeout);
      try {
        const cert = socket.getPeerCertificate();
        const valid = cert.valid_to && new Date(cert.valid_to) > new Date();
        socket.end();
        resolve(valid);
      } catch (err) {
        socket.end();
        resolve(false);
      }
    });
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

// ===============================
// Prüft, ob ein String eine gültige URL ist (Syntaxprüfung)
// Rückgabe: true/false
// ===============================

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// ===============================
// Hauptfunktion: Prüft eine URL auf Erreichbarkeit, SSL-Gültigkeit, IP, Weiterleitung und Virenstatus
// Gibt ein umfassendes Ergebnisobjekt zurück, das alle Prüfergebnisse enthält
// ===============================

async function checkUrl(url) {
  if (!isValidUrl(url)) {
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
    const start = Date.now();
    const response = await axios.get(url, {
      maxRedirects: 0,
      timeout: 10000,
      validateStatus: null,
      headers: { 'User-Agent': 'URL-Checker/1.0' }
    });
    const end = Date.now();
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const [ip, sslValid, virusCheck] = await Promise.all([
      resolveIp(hostname),
      parsedUrl.protocol === 'https:' ? checkSslValid(hostname) : Promise.resolve(null),
      checkUrlVirusTotal(url)
    ]);
    return {
      url,
      status_code: response.status,
      response_time: end - start,
      ssl_valid: sslValid,
      redirect: response.status >= 300 && response.status < 400,
      ip,
      headers: {
        'content-type': response.headers['content-type'],
        'server': response.headers['server']
      },
      virus_check: virusCheck
    };
  } catch (err) {
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
      error: err.code || err.message
    };
  }
}


// Berechnet Basisstatistiken (z. B. Statuscode-Verteilung, Ladezeiten) aus Beispieldaten
async function getStats() {
  const dummyData = [
    { status_code: 200, response_time: 120, redirect: false },
    { status_code: 301, response_time: 180, redirect: true },
    { status_code: 404, response_time: 90, redirect: false }
  ];
  const total = dummyData.length;
  const online = dummyData.filter(r => r.status_code === 200).length;
  const redirects = dummyData.filter(r => r.redirect).length;
  const avgTime = Math.round(dummyData.reduce((acc, r) => acc + r.response_time, 0) / total);
  const distribution = {
    '2xx': dummyData.filter(r => r.status_code >= 200 && r.status_code < 300).length,
    '3xx': dummyData.filter(r => r.status_code >= 300 && r.status_code < 400).length,
    '4xx': dummyData.filter(r => r.status_code >= 400 && r.status_code < 500).length,
    '5xx': dummyData.filter(r => r.status_code >= 500).length
  };
  return { total, online, redirects, avg_response_time: avgTime, distribution };
}

// Exportiert Ergebnisdaten als CSV-Text
async function exportCsv() {
  const results = [
    { url: 'https://example.com', status_code: 200, response_time: 120, ssl_valid: true, redirect: false, ip: '93.184.216.34' },
    { url: 'https://test.com', status_code: 301, response_time: 180, ssl_valid: true, redirect: true, ip: '104.21.92.84' }
  ];
  const headers = Object.keys(results[0]).join(',');
  const rows = results.map(obj => Object.values(obj).join(','));
  return [headers, ...rows].join('\n');
}

// Holt GeoIP-Daten (Land, Stadt, Organisation) zu einer IP-Adresse
async function getGeoIp(ip) {
  try {
    const res = await axios.get(`https://ipapi.co/${ip}/json/`);
    const { country_name, city, org } = res.data;
    return { country: country_name, city, org };
  } catch {
    return { country: null, city: null, org: null };
  }
}

// Erstellt einen Screenshot der angegebenen URL und speichert ihn lokal ab
async function takeScreenshot(url, filename) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url, { timeout: 10000 });
    const dir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    const filepath = path.join(dir, `${filename}.png`);
    await page.screenshot({ path: filepath });
    await browser.close();
    return filepath;
  } catch (err) {
    await browser.close();
    return null;
  }
}

// ===============================
// Misst die Ausführungszeit einer beliebigen asynchronen Funktion
// Gibt das Ergebnis der Funktion und die gemessene Dauer in Millisekunden zurück
// ===============================

async function measureExecutionTime(func) {
  const start = performance.now();
  const result = await func();
  const end = performance.now();
  return { result, duration: end - start };
}


// Exportiert alle Hauptfunktionen für die Nutzung in index.js
module.exports = {
  checkUrl,
  measureExecutionTime,
  getStats,
  exportCsv,
  getGeoIp,
  takeScreenshot
};
