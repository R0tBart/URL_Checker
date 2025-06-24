function renderField(key, value) {
  // Diese Felder fett und unterstrichen
  const highlight = ['url', 'headers', 'virus_check'];
  const isHighlight = highlight.includes(key.toLowerCase());
  const labelStyle = isHighlight
    ? 'font-weight:bold;text-decoration:underline;'
    : 'font-weight:bold;';

  if (value !== undefined && value !== null && value !== '') {
    if (typeof value === 'object') {
      return `
        <div class="${key}">
          <strong style="${labelStyle}">${key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
          <div class="subfields">
            ${Object.entries(value).map(([subKey, subValue]) => renderField(subKey, subValue)).join('')}
          </div>
        </div>
      `;
    } else if (key === 'status') {
      return `
        <div class="${key}">
          <strong style="${labelStyle}">Status:</strong> ${value === 'OK' ? '✔️ OK' : '❌ Fehler'}
        </div>
      `;
    } else {
      return `
        <div class="${key}">
          <strong style="${labelStyle}">${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}
        </div>
      `;
    }
  } else {
    return `
      <div class="${key}">
        <strong style="${labelStyle}">${key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
        <span style="color:#ef4444">Fehlt</span>
      </div>
    `;
  }
}

document.getElementById('urlForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const urlsInput = document.getElementById('urls').value;
  const urls = urlsInput
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  const resultBox = document.getElementById('result');
  resultBox.textContent = 'Prüfe URLs...';
  resultBox.classList.add('has-content');

  try {
    const response = await fetch('http://localhost:8000/check-urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls })
    });

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];

    // Wenn keine Ergebnisse, trotzdem alle URLs anzeigen
    const displayResults = results.length > 0
      ? results
      : urls.map(url => ({
          url,
          status: 'Fehler',
          info: data.error || 'Keine Daten vom Server'
        }));

    resultBox.innerHTML = `
      <div class="result-cards">
        ${displayResults.map(r => `
          <div class="result-card ${r.status === 'OK' ? 'ok' : 'fail'}">
            ${Object.entries(r).map(([key, value]) => renderField(key, value)).join('')}
          </div><br><br>
        `).join('')}
      </div>
      <div id="result-buttons" style="margin-top:24px;display:flex;gap:16px;">
        <button id="screenshotBtn" style="background:#fff700;color:#222;font-weight:bold;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;">Screenshot</button>
        <button id="exportBtn" style="background:#fff700;color:#222;font-weight:bold;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;">Exportieren</button>
      </div>
    `;
    resultBox.classList.add('has-content');
  } catch (err) {
    // Bei komplettem Verbindungsfehler alle URLs als Fehler anzeigen
    resultBox.innerHTML = `
      <div class="result-cards">
        ${urls.map(url => `
          <div class="result-card fail">
            <div class="url"><strong style="font-weight:bold;text-decoration:underline;">URL:</strong> ${url}</div>
            <div class="status"><strong>Status:</strong> ❌ Fehler</div>
            <div class="info"><strong>Info:</strong> Verbindung zum Server fehlgeschlagen</div>
          </div><br><br>
        `).join('')}
      </div>
      <div id="result-buttons" style="margin-top:24px;display:flex;gap:16px;">
        <button id="screenshotBtn" style="background:#fff700;color:#222;font-weight:bold;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;">Screenshot</button>
        <button id="exportBtn" style="background:#fff700;color:#222;font-weight:bold;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;">Exportieren</button>
      </div>
    `;
    resultBox.classList.add('has-content');
  }
});