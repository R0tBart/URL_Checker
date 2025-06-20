// backend/utils.js
const axios = require('axios');
const dns = require('dns').promises;
const tls = require('tls');
const { URL } = require('url');

// Hilfsfunktion zur IP-Auflösung
async function resolveIp(hostname) {
  try {
    const result = await dns.lookup(hostname);
    return result.address;
  } catch (err) {
    return null;
  }
}

// Hilfsfunktion zur SSL-Zertifikatprüfung
function checkSslValid(hostname, port = 443) {
  return new Promise((resolve) => {
    const socket = tls.connect(port, hostname, { servername: hostname, rejectUnauthorized: false }, () => {
      const cert = socket.getPeerCertificate();
      const valid = cert.valid_to && new Date(cert.valid_to) > new Date();
      socket.end();
      resolve(valid);
    });

    socket.on('error', () => resolve(false));
  });
}

// Hauptfunktion zum Prüfen einer URL
async function checkUrl(url) {
  try {
    const start = Date.now();
    const response = await axios.get(url, { maxRedirects: 0, timeout: 5000, validateStatus: null });
    const end = Date.now();

    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    const ip = await resolveIp(hostname);
    const sslValid = parsedUrl.protocol === 'https:' ? await checkSslValid(hostname) : null;

    return {
      url,
      status_code: response.status,
      response_time: end - start,
      ssl_valid: sslValid,
      redirect: response.status >= 300 && response.status < 400,
      ip
    };
  } catch (err) {
    return {
      url,
      status_code: null,
      response_time: null,
      ssl_valid: null,
      redirect: false,
      ip: null,
      error: err.message
    };
  }
}

module.exports = { checkUrl };
