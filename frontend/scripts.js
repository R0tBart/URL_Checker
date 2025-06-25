function renderField(key, value) {
    // Diese Felder fett und unterstrichen
    const highlight = ['url', 'headers', 'virus_check', 'stats'];
    const isHighlight = highlight.includes(key.toLowerCase());
    const labelStyle = isHighlight
        ? 'font-weight:bold;text-decoration:underline;'
        : 'font-weight:bold;';

    if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object') {
            const breakKeys = ['headers', 'virus_check', 'stats'];
            const addBreak = breakKeys.includes(key.toLowerCase()) ? '<br>' : '';
            return `
                <div class="${key}">
                    ${addBreak}<strong style="${labelStyle}">${key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                    <div class="subfields">
                        ${Object.entries(value).map(([subKey, subValue]) => renderField(subKey, subValue)).join('')}
                    </div>
                </div>
            `;
        } else if (key === 'status') {
            return `
                <div class="${key}">
                    <strong style="${labelStyle}">Status:</strong> ${value === 'OK' ? '✔️' : '❌'}
                </div>
            `;
        } else if (
            key.toLowerCase().replace(/\s+/g, '_') === 'status_code'
        ) {
            // Fehlercode farbig je nach Wert
            let color = '#999';
            if (value >= 500) color = '#ef4444';
            else if (value >= 400 && value <= 403) color = '#ffe066';
            else if (value >= 404 && value < 500) color = '#f59e42';
            else if (value >= 300) color = '#3b82f6';
            else if (value >= 200) color = '#22c55e';

            return `
                <div class="${key}">
                    <strong style="${labelStyle}">${key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                    <span style="color:${color};font-weight:bold;">${value}</span>
                </div>
            `;
        } else if (['url', 'permalink'].includes(key.toLowerCase())) {
            // Macht URL und Permalink anklickbar
            return `
                <div class="${key}">
                    <strong style="${labelStyle}">${key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                    <a href="${value}" target="_blank" rel="noopener noreferrer">${value}</a>
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
                <span style="color:#ef4444">Missing</span>
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
                status: 'fail',
                info: data.error || 'missing data from server',
            }));

        // --- HIER: Buttons und Auswahlfeld nebeneinander ---
        resultBox.innerHTML = `
            <div class="result-cards">
                ${displayResults.map(r => `
                    <div class="result-card ${r.status === 'OK' ? 'ok' : 'fail'}">
                        ${Object.entries(r).map(([key, value]) => renderField(key, value)).join('')}
                    </div><br><hr style="border:0;border-top:2px solid #fff;margin:24px 0;"><br>
                `).join('')}
            </div>
            <div id="result-buttons" style="margin-top:24px;display:flex;gap:8px;align-items:center;">
                <button id="screenshotBtn" style="background:#fff700;color:#222;font-weight:bold;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;">Screenshot</button>
                <button id="exportBtn" style="background:#fff700;color:#222;font-weight:bold;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;">Exportieren</button>
                <select id="exportType" style="height:36px;font-size:1em;border-radius:4px;margin-left:4px;">
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                </select>
            </div>
        `;
        resultBox.classList.add('has-content');

        // Screenshot-Button
        document.getElementById('screenshotBtn').onclick = function() {
            const resultCards = document.querySelector('.result-cards');
            html2canvas(resultCards, {backgroundColor: "#fff", scale: 2}).then(canvas => {
                const link = document.createElement('a');
                link.download = 'screenshot.png';
                link.href = canvas.toDataURL();
                link.click();
            });
        };

        // Exportieren-Button
        document.getElementById('exportBtn').onclick = function() {
            const exportType = document.getElementById('exportType').value;
            // Daten für Tabelle sammeln
            let tableHeaders = [];
            let tableData = [];
            document.querySelectorAll('.result-card').forEach((card, idx) => {
                let row = {};
                card.querySelectorAll('div').forEach(div => {
                    const label = div.querySelector('strong') ? div.querySelector('strong').innerText.replace(':','') : '';
                    const value = div.querySelector('a') ? div.querySelector('a').innerText : (div.innerText.split(':')[1] || '').trim();
                    if(label) {
                        row[label] = value;
                        if(idx === 0 && !tableHeaders.includes(label)) tableHeaders.push(label);
                    }
                });
                if(Object.keys(row).length) tableData.push(row);
            });

            if (exportType === 'pdf') {
                const doc = new window.jspdf.jsPDF({orientation: 'landscape', unit: 'pt', format: 'a4'});
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(28);
                doc.text('URL Checker Ergebnis', 40, 60);
                doc.setFontSize(15);
                doc.setFont('helvetica', 'normal');
                doc.text('Erstellt am: ' + new Date().toLocaleString(), 40, 90);

                doc.autoTable({
    startY: 120,
    head: [tableHeaders],
    body: tableData.map(row => tableHeaders.map(h => row[h] || '')),
    styles: {
        font: 'helvetica',
        fontSize: 13,
        cellPadding: 8,
        overflow: 'linebreak',
        valign: 'middle',
        textColor: [34, 34, 34],
        lineColor: [180, 180, 180],
        lineWidth: 0.5,
        minCellHeight: 24,
    },
    headStyles: {
        fillColor: [44, 62, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 14,
    },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    margin: { left: 40, right: 40 },
    tableLineColor: [180, 180, 180],
    tableLineWidth: 0.75,
    didDrawPage: function (data) {
        doc.setFontSize(11);
        doc.setTextColor(120);
        doc.text('© Layer8 Security', data.settings.margin.left, doc.internal.pageSize.height - 10);
    },
    // Automatische Spaltenbreite und Seitenumbruch
    columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' },
        6: { cellWidth: 'auto' },
        7: { cellWidth: 'auto' },
        8: { cellWidth: 'auto' },
        9: { cellWidth: 'auto' },
        // ... falls du mehr Spalten hast, erweitere hier
    },
    pageBreak: 'auto',
    useCss: true
});

                doc.save('result.pdf');
            } else if (exportType === 'csv') {
                let csv = [];
                csv.push(tableHeaders.join(';'));
                tableData.forEach(row => {
                    csv.push(tableHeaders.map(h => `"${(row[h]||'').replace(/"/g, '""')}"`).join(';'));
                });

                const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'result.csv';
                link.click();
            }
        };
    } catch (err) {
        // Bei komplettem Verbindungsfehler alle URLs als Fehler anzeigen
        resultBox.innerHTML = `
            <div class="result-cards">
                ${urls.map(url => `
                    <div class="result-card fail">
                        <div class="url"><strong style="font-weight:bold;text-decoration:underline;">URL:</strong> ${url}</div>
                        <div class="status"><strong>Status:</strong> ❌ </div>
                        <div class="info"><strong>Info:</strong> Verbindung zum Server fehlgeschlagen</div>
                    </div><br><br>
                `).join('')}
            </div>
            <div id="result-buttons" style="margin-top:24px;display:flex;gap:8px;align-items:center;">
                <button id="screenshotBtn" style="background:#fff700;color:#222;font-weight:bold;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;">Screenshot</button>
                <button id="exportBtn" style="background:#fff700;color:#222;font-weight:bold;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;">Exportieren</button>
                <select id="exportType" style="height:36px;font-size:1em;border-radius:4px;margin-left:4px;">
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                </select>
            </div>
        `;
        resultBox.classList.add('has-content');

        // Die gleichen Event-Handler wie oben!
        document.getElementById('screenshotBtn').onclick = function() {
            const resultCards = document.querySelector('.result-cards');
            html2canvas(resultCards, {backgroundColor: "#fff", scale: 2}).then(canvas => {
                const link = document.createElement('a');
                link.download = 'screenshot.png';
                link.href = canvas.toDataURL();
                link.click();
            });
        };

        document.getElementById('exportBtn').onclick = function() {
            const exportType = document.getElementById('exportType').value;
            let tableHeaders = [];
            let tableData = [];
            document.querySelectorAll('.result-card').forEach((card, idx) => {
                let row = {};
                card.querySelectorAll('div').forEach(div => {
                    const label = div.querySelector('strong') ? div.querySelector('strong').innerText.replace(':','') : '';
                    const value = div.querySelector('a') ? div.querySelector('a').innerText : (div.innerText.split(':')[1] || '').trim();
                    if(label) {
                        row[label] = value;
                        if(idx === 0 && !tableHeaders.includes(label)) tableHeaders.push(label);
                    }
                });
                if(Object.keys(row).length) tableData.push(row);
            });

            if (exportType === 'pdf') {
                const doc = new window.jspdf.jsPDF({orientation: 'landscape', unit: 'pt', format: 'a4'});
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(28);
                doc.text('URL Checker Ergebnis', 40, 60);
                doc.setFontSize(15);
                doc.setFont('helvetica', 'normal');
                doc.text('Erstellt am: ' + new Date().toLocaleString(), 40, 90);

                doc.autoTable({
                    startY: 120,
                    head: [tableHeaders],
                    body: tableData.map(row => tableHeaders.map(h => row[h] || '')),
                    styles: {
                        font: 'helvetica',
                        fontSize: 16,
                        cellPadding: 12,
                        overflow: 'linebreak',
                        valign: 'middle',
                        textColor: [30, 30, 30],
                        lineColor: [120, 120, 120],
                        lineWidth: 1.2,
                    },
                    headStyles: {
                        fillColor: [44, 62, 80],
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        fontSize: 17,
                    },
                    alternateRowStyles: { fillColor: [230, 240, 255] },
                    margin: { left: 40, right: 40 },
                    tableLineColor: [120, 120, 120],
                    tableLineWidth: 1.2,
                    didDrawPage: function (data) {
                        doc.setFontSize(12);
                        doc.setTextColor(120);
                        doc.text('© Layer8 Security', data.settings.margin.left, doc.internal.pageSize.height - 10);
                    }
                });

                doc.save('result.pdf');
            } else if (exportType === 'csv') {
                let csv = [];
                csv.push(tableHeaders.join(';'));
                tableData.forEach(row => {
                    csv.push(tableHeaders.map(h => `"${(row[h]||'').replace(/"/g, '""')}"`).join(';'));
                });

                const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'result.csv';
                link.click();
            }
        };
    }
});