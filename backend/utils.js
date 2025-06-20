// backend/utils.js
const axios = require('axios'); // Importiert die Axios-Bibliothek für HTTP-Anfragen
const dns = require('dns').promises; // Importiert das DNS-Modul für die Namensauflösung (Promise-basiert)
const tls = require('tls'); // Importiert das TLS-Modul für die SSL-Zertifikatprüfung
const { URL } = require('url'); // Importiert die URL-Klasse zum Parsen von URLs

// Hilfsfunktion zur IP-Auflösung eines Hostnamens
async function resolveIp(hostname) {
  try {
    const result = await dns.lookup(hostname); // Führt eine DNS-Abfrage durch
    return result.address; // Gibt die aufgelöste IP-Adresse zurück
  } catch (err) {
    // Warnt bei fehlgeschlagener DNS-Auflösung und gibt null zurück
    console.warn(`DNS-Auflösung fehlgeschlagen für ${hostname}:`, err.message);
    return null;
  }
}

// Hilfsfunktion zur SSL-Zertifikatprüfung einer HTTPS-Verbindung
function checkSslValid(hostname, port = 443) {
  return new Promise((resolve) => {
    // Setzt einen Timeout für die SSL-Prüfung, falls die Verbindung hängt
    const timeout = setTimeout(() => {
      resolve(false); // Löst mit false auf, wenn der Timeout erreicht ist
    }, 5000);

    // Stellt eine TLS-Verbindung her
    const socket = tls.connect(port, hostname, { 
      servername: hostname, 
      rejectUnauthorized: false, // Erlaubt selbstsignierte Zertifikate (für Testzwecke)
      timeout: 5000 // Timeout für die Socket-Verbindung
    }, () => {
      clearTimeout(timeout); // Löscht den Timeout, da die Verbindung hergestellt wurde
      try {
        const cert = socket.getPeerCertificate(); // Holt das SSL-Zertifikat
        // Überprüft, ob das Zertifikat gültig ist (nicht abgelaufen)
        const valid = cert.valid_to && new Date(cert.valid_to) > new Date();
        socket.end(); // Schließt die Socket-Verbindung
        resolve(valid); // Löst mit dem Validierungsstatus auf
      } catch (err) {
        socket.end(); // Schließt die Socket-Verbindung auch bei Fehlern
        resolve(false); // Löst mit false auf, wenn ein Fehler auftritt
      }
    });

    // Fehlerbehandlung für den Socket
    socket.on('error', () => {
      clearTimeout(timeout); // Löscht den Timeout
      resolve(false); // Löst mit false auf
    });

    // Timeout-Behandlung für den Socket
    socket.on('timeout', () => {
      clearTimeout(timeout); // Löscht den Timeout
      socket.destroy(); // Zerstört den Socket
      resolve(false); // Löst mit false auf
    });
  });
}

// Hilfsfunktion zur Validierung einer URL-Zeichenkette
function isValidUrl(string) {
  try {
    new URL(string); // Versucht, eine URL zu erstellen
    return true; // Erfolgreich, URL ist gültig
  } catch (_) {
    return false; // Fehler, URL ist ungültig
  }
}

// Hauptfunktion zum Prüfen einer URL
async function checkUrl(url) {
  // URL vor der Verarbeitung validieren
  if (!isValidUrl(url)) {
    return {
      url,
      status_code: null,
      response_time: null,
      ssl_valid: null,
      redirect: false,
      ip: null,
      error: 'Ungültige URL' // Gibt einen Fehler für ungültige URLs zurück
    };
  }

  try {
    const start = Date.now(); // Startzeit der Anfrage
    // Führt eine GET-Anfrage an die URL durch
    const response = await axios.get(url, { 
      maxRedirects: 0, // Folgt keinen Weiterleitungen
      timeout: 10000, // Timeout für die HTTP-Anfrage (10 Sekunden)
      validateStatus: null, // Akzeptiert alle Statuscodes (keine Fehler bei 4xx/5xx)
      headers: {
        'User-Agent': 'URL-Checker/1.0' // Setzt einen User-Agent-Header
      }
    });
    const end = Date.now(); // Endzeit der Anfrage

    const parsedUrl = new URL(url); // Parsen der URL für Hostname und Protokoll
    const hostname = parsedUrl.hostname; // Extrahiert den Hostnamen

    // Führt IP-Auflösung und SSL-Prüfung parallel aus
    const [ip, sslValid] = await Promise.all([
      resolveIp(hostname), // Ruft die IP-Adresse ab
      parsedUrl.protocol === 'https:' ? checkSslValid(hostname) : Promise.resolve(null) // Prüft SSL nur bei HTTPS
    ]);

    // Gibt die gesammelten Prüfergebnisse zurück
    return {
      url,
      status_code: response.status,
      response_time: end - start,
      ssl_valid: sslValid,
      redirect: response.status >= 300 && response.status < 400, // Prüft auf Weiterleitung
      ip,
      headers: {
        'content-type': response.headers['content-type'], // Extrahiert Content-Type Header
        'server': response.headers['server'] // Extrahiert Server Header
      }
    };
  } catch (err) {
    // Fehlerbehandlung bei Problemen mit der HTTP-Anfrage
    const parsedUrl = new URL(url);
    // Versucht, die IP-Adresse auch bei Fehlern aufzulösen
    const ip = await resolveIp(parsedUrl.hostname).catch(() => null);
    
    // Gibt Fehlerdetails zurück
    return {
      url,
      status_code: null,
      response_time: null,
      ssl_valid: null,
      redirect: false,
      ip,
      error: err.code || err.message // Gibt Fehlercode oder Fehlermeldung zurück
    };
  }
}

module.exports = { checkUrl }; // Exportiert die checkUrl-Funktion
