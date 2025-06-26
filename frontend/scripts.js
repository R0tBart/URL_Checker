function normalizeUrl(input) {
    let url = input.trim();
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }
    return url;
}

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

function exportKurzberichtPDF(tableHeaders, tableData) {
    if (!Array.isArray(tableHeaders) || !Array.isArray(tableData) || tableHeaders.length === 0 || tableData.length === 0) {
        alert('Keine Daten zum Exportieren vorhanden!');
        return;
    }
    // Entferne Virustotal-Link/Permalink, fasse Virus-Check als Ergebnistext und Symbol zusammen
    const filteredHeaders = tableHeaders.filter(h => h.toLowerCase() !== 'permalink' && h.toLowerCase() !== 'url' && h.toLowerCase() !== 'virustotal');
    // Füge die URL als erste Spalte wieder hinzu, aber ohne Permalink
    if(tableHeaders.includes('URL')) filteredHeaders.unshift('URL');
    // Virus-Check grafisch und als Text (z.B. "OK"/"Gefunden")
    const bodyData = tableData.map(row => {
        return filteredHeaders.map(h => {
            if(h.toLowerCase() === 'virus_check' && row[h]) {
                // Wert ist z.B. "OK" oder "Gefunden"
                if(row[h].toLowerCase().includes('ok')) {
                    return '✔️ OK';
                } else if(row[h].toLowerCase().includes('gefunden') || row[h].toLowerCase().includes('found')) {
                    return '❌ Gefunden';
                } else {
                    return row[h];
                }
            }
            return row[h] || '';
        });
    });
    // Querformat, wenn mehr als 5 Spalten
    const orientation = filteredHeaders.length > 5 ? 'landscape' : 'portrait';
    const doc = new window.jspdf.jsPDF({orientation, unit: 'pt', format: 'a4'});
    // Titel
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(34, 60, 120);
    doc.text('URL Checker Bericht', 40, 50);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Erstellt am: ' + new Date().toLocaleString(), 40, 70);
    // Tabelle
    doc.autoTable({
        startY: 90,
        head: [filteredHeaders],
        body: bodyData,
        styles: {
            font: 'helvetica',
            fontSize: 8.5,
            cellPadding: 3.5,
            overflow: 'linebreak',
            valign: 'middle',
            textColor: [34, 34, 34],
            lineColor: [120, 160, 220],
            lineWidth: 0.5,
            minCellHeight: 12,
        },
        headStyles: {
            fillColor: [34, 60, 120],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9.5,
            halign: 'center',
            valign: 'middle',
        },
        alternateRowStyles: { fillColor: [235, 242, 255] },
        margin: { left: 20, right: 20 },
        tableLineColor: [120, 160, 220],
        tableLineWidth: 0.5,
        didDrawPage: function (data) {
            // Footer
            doc.setFontSize(9);
            doc.setTextColor(120);
            doc.text('© Layer8 Security', data.settings.margin.left, doc.internal.pageSize.height - 10);
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            doc.text('Seite ' + doc.internal.getNumberOfPages(), pageSize.width - 60, pageHeight - 10);
        },
        columnStyles: Object.fromEntries(filteredHeaders.map((h, i) => [i, {cellWidth: 'auto', minCellWidth: 40, maxCellWidth: 90, halign: 'left'}])),
        pageBreak: 'auto',
        useCss: true,
        theme: 'grid',
        showHead: 'everyPage',
    });
    doc.save('bericht.pdf');
}

let originalResults = [];

function exportNetzwerkUndVirusPDFCSV(results, exportType) {
    if (!Array.isArray(results) || results.length === 0) {
        alert('Keine Daten für den Export gefunden!');
        return;
    }
    // Mapping für menschenlesbare Spaltennamen
    const headerMap = {
        url: 'URL',
        status_code: 'Statuscode',
        response_time: 'Antwortzeit (ms)',
        ssl_valid: 'SSL gültig',
        redirect: 'Weiterleitung',
        ip: 'IP-Adresse',
        info: 'Info',
        status: 'Status',
        error: 'Fehler',
        'headers: content-type': 'Content-Type',
        'headers: server': 'Server',
        'virus_check: harmless': 'VirusTotal: Harmlos',
        'virus_check: malicious': 'VirusTotal: Bösartig',
        'virus_check: suspicious': 'VirusTotal: Verdächtig',
        'virus_check: undetected': 'VirusTotal: Unentdeckt',
        'virus_check: timeout': 'VirusTotal: Timeout',
        'virus_check: stats': 'VirusTotal: Stats',
        'virus_check: error': 'VirusTotal: Fehler',
        'virus_check: suspicious': 'VirusTotal: Verdächtig',
        'virus_check: harmless': 'VirusTotal: Harmlos',
        'virus_check: undetected': 'VirusTotal: Unentdeckt',
        'virus_check: timeout': 'VirusTotal: Timeout',
        'virus_check: malicious': 'VirusTotal: Bösartig',
        // weitere Mappings nach Bedarf
    };
    // Alle Keys aus dem ersten Ergebnis, außer 'permalink' (und ggf. weitere Links)
    const allKeys = Object.keys(results[0] || {}).filter(k => k.toLowerCase() !== 'permalink');
    // Für verschachtelte Objekte (z.B. virus_check.stats, headers) flache Darstellung
    let expandedHeaders = [];
    results.forEach(row => {
        allKeys.forEach(k => {
            const v = row[k];
            if (v && typeof v === 'object' && !Array.isArray(v)) {
                Object.keys(v).forEach(subKey => {
                    const header = k + ': ' + subKey;
                    if (!expandedHeaders.includes(header)) expandedHeaders.push(header);
                });
            } else {
                if (!expandedHeaders.includes(k)) expandedHeaders.push(k);
            }
        });
    });
    // Entferne alle Spalten, die mit VirusTotal/Virus_check zu tun haben, sowie 'content-type' und 'server' (auch als verschachtelte Header)
    const filteredHeaders = expandedHeaders.filter(h =>
        !/^virus_check/i.test(h) &&
        !/^virus_check:/i.test(h) &&
        h !== 'content-type' &&
        h !== 'server' &&
        h !== 'headers: content-type' &&
        h !== 'headers: server'
    );

    // Nur EINE VirusTotal-Status-Spalte hinzufügen
    const filteredHeadersWithVT = [...filteredHeaders, 'virustotal_status'];

    const filteredData = results.map(row => {
        const rowData = filteredHeaders.map(h => {
            if (h.includes(': ')) {
                const [main, sub] = h.split(': ');
                const v = row[main];
                if (v && typeof v === 'object' && v[sub] !== undefined) return v[sub];
                return '';
            } else {
                return row[h] !== undefined ? row[h] : '';
            }
        });
        // VirusTotal-Status bestimmen
        let vtStatus = '';
        if (row.virus_check && (row.virus_check.malicious !== undefined || row.virus_check.malicious === false)) {
            vtStatus = row.virus_check.malicious ? 'Schädlich' : 'Nicht schädlich';
        }
        rowData.push(vtStatus);
        return rowData;
    });
    // Menschenlesbare Header
    const readableHeaders = filteredHeadersWithVT.map(h => {
        if (h === 'virustotal_status') return 'VirusTotal Status';
        return headerMap[h] || h.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    });
    if (filteredHeaders.length === 0) {
        alert('Keine passenden Daten für den Export gefunden!');
        return;
    }
    // Tabellen in 6er-Gruppen aufteilen, inklusive VirusTotal-Status-Spalte am Ende
    const chunkSize = 6;
    const headerChunks = [];
    const totalCols = filteredHeadersWithVT.length;
    for (let i = 0; i < totalCols; i += chunkSize) {
        headerChunks.push({
            headers: filteredHeadersWithVT.slice(i, i + chunkSize),
            readable: readableHeaders.slice(i, i + chunkSize)
        });
    }
    const dataChunks = headerChunks.map(chunk =>
        filteredData.map(row => chunk.headers.map((_, idx) => row[idx + headerChunks[0].headers.length * headerChunks.indexOf(chunk)]))
    );
    if (exportType === 'pdf') {
        // Dynamische Schriftgröße je nach Spaltenanzahl
        function getFontSize(numCols) {
            if (numCols <= 6) return 11;
            if (numCols <= 8) return 9.5;
            if (numCols <= 10) return 8.5;
            return 7.5;
        }
        const doc = new window.jspdf.jsPDF({orientation: 'portrait', unit: 'pt', format: 'a4'});
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(34, 60, 120);
        doc.text('URL Checker Export', 40, 50);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text('Erstellt am: ' + new Date().toLocaleString(), 40, 70);
        let startY = 90;
        dataChunks.forEach((body, idx) => {
            const numCols = headerChunks[idx].headers.length;
            doc.autoTable({
                startY: startY,
                head: [headerChunks[idx].readable],
                body: body,
                styles: {
                    font: 'helvetica',
                    fontSize: getFontSize(numCols),
                    cellPadding: numCols > 8 ? 3 : 6,
                    overflow: 'ellipsize',
                    valign: 'middle',
                    textColor: [34, 34, 34],
                    lineColor: [120, 160, 220],
                    lineWidth: 0.6,
                    minCellHeight: 16,
                },
                headStyles: {
                    fillColor: [34, 60, 120],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: Math.max(getFontSize(numCols), 9),
                    halign: 'center',
                    valign: 'middle',
                },
                alternateRowStyles: { fillColor: [235, 242, 255] },
                margin: { left: 20, right: 20 },
                tableLineColor: [120, 160, 220],
                tableLineWidth: 0.6,
                didDrawPage: function (data) {
                    doc.setFontSize(10);
                    doc.setTextColor(120);
                    doc.text('© Layer8 Security', data.settings.margin.left, doc.internal.pageSize.height - 10);
                    const pageSize = doc.internal.pageSize;
                    const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                    doc.text('Seite ' + doc.internal.getNumberOfPages(), pageSize.width - 60, pageHeight - 10);
                },
                columnStyles: Object.fromEntries(headerChunks[idx].headers.map((h, i) => [i, {cellWidth: 'auto', minCellWidth: 60, maxCellWidth: 200, halign: 'left'}])),
                pageBreak: 'auto',
                useCss: true,
                theme: 'grid',
                showHead: 'everyPage',
            });
            startY = doc.lastAutoTable.finalY + 30;
        });
        doc.save('urlchecker_export.pdf');
    } else if (exportType === 'csv') {
        let csv = [];
        headerChunks.forEach(chunk => {
            csv.push(chunk.readable.join(';'));
            filteredData.forEach(row => {
                csv.push(chunk.headers.map((h, idx) => {
                    const colIdx = filteredHeaders.indexOf(h);
                    return `"${(row[colIdx]||'').toString().replace(/"/g, '""')}"`;
                }).join(';'));
            });
            csv.push(''); // Leerzeile zwischen den Tabellen
        });
        const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'urlchecker_export.csv';
        link.click();
    }
}

document.getElementById('urlForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const urlsInput = document.getElementById('urls').value;
    const urls = urlsInput
        .split('\n')
        .map(url => normalizeUrl(url))
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
        originalResults = results;

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
            exportNetzwerkUndVirusPDFCSV(originalResults, exportType);
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

        // Exportieren-Button (Fehlerfall)
        document.getElementById('exportBtn').onclick = function() {
            const exportType = document.getElementById('exportType').value;
            // Fehlerdaten aus der Anzeige sammeln
            let tableHeaders = ['URL', 'Status', 'Info'];
            let tableData = [];
            document.querySelectorAll('.result-card').forEach(card => {
                let row = {};
                card.querySelectorAll('div').forEach(div => {
                    const label = div.querySelector('strong') ? div.querySelector('strong').innerText.replace(':','') : '';
                    const value = div.querySelector('a') ? div.querySelector('a').innerText : (div.innerText.split(':')[1] || '').trim();
                    if(label) row[label] = value;
                });
                if(Object.keys(row).length) tableData.push(row);
            });

            if (exportType === 'pdf') {
                const doc = new window.jspdf.jsPDF({orientation: 'landscape', unit: 'pt', format: 'a4'});
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(28);
                doc.text('URL Checker Fehlerbericht', 40, 60);
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

                doc.save('fehlerbericht.pdf');
            } else if (exportType === 'csv') {
                let csv = [];
                csv.push(tableHeaders.join(';'));
                tableData.forEach(row => {
                    csv.push(tableHeaders.map(h => `"${(row[h]||'').replace(/"/g, '""')}"`).join(';'));
                });

                const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'fehlerbericht.csv';
                link.click();
            }
        };
    }
});