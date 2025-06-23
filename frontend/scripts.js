// Annahme: Es gibt ein Formular mit id="urlForm", ein Eingabefeld mit id="urls" und eine Box mit id="result"

document.getElementById('urlForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // URLs aus dem Eingabefeld holen (z.B. durch Zeilenumbruch getrennt)
  const urlsInput = document.getElementById('urls').value;
  const urls = urlsInput
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  // Ergebnis-Box referenzieren
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

    if (response.ok) {
      // Ergebnisse schön formatieren
      resultBox.innerHTML = `<pre>${JSON.stringify(data.results, null, 2)}</pre>`;
    } else {
      resultBox.textContent = data.error || 'Fehler bei der Anfrage';
    }
  } catch (err) {
    resultBox.textContent = 'Verbindung zum Server fehlgeschlagen';
  }
});