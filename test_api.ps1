# ===============================
# PowerShell-Testskript für das URL-Checker-Backend
# Dieses Skript testet den /check-urls-Endpunkt und gibt die wichtigsten Prüfergebnisse aus.
# ===============================

# Test-URLs definieren (beliebig erweiterbar)
$urls = @(
    "https://example.com",
    "http://google.com",
    "https://github.com"
)

# JSON-Body für die POST-Anfrage erstellen
# Das Backend erwartet ein Feld "urls" mit einer Liste von URLs
$body = @{ urls = $urls } | ConvertTo-Json -Depth 2

# Sende die POST-Anfrage an das Backend und werte die Antwort aus
try {
    Write-Host "🚀 Sende Anfrage an Backend..."
    $response = Invoke-RestMethod `
        -Uri "http://localhost:8000/check-urls" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"

    # Überprüft, ob die Antwort das erwartete Format hat (Array von Ergebnissen)
    if ($response.results -is [System.Array]) {
        Write-Host "`n✅ Backend-Antwort OK (${$response.count} URLs geprüft):"
        foreach ($item in $response.results) {
            # Gibt die wichtigsten Prüfergebnisse für jede URL aus
            Write-Host "`nURL:" $item.url -ForegroundColor Cyan
            
            # Status und Performance
            Write-Host "  Status:" $item.status_code -ForegroundColor $(
                if ($item.status_code -eq 200) { "Green" } 
                elseif ($item.status_code -ge 400) { "Red" } 
                else { "Yellow" }
            )
            Write-Host "  Ladezeit:" $item.response_time "ms"
            
            # SSL und Redirect
            Write-Host "  SSL gültig:" $item.ssl_valid -ForegroundColor $(
                if ($item.ssl_valid -eq $true) { "Green" }
                elseif ($item.ssl_valid -eq $false) { "Red" }
                else { "Gray" }
            )
            Write-Host "  Redirect:" $item.redirect
            
            # Technische Details
            Write-Host "  IP:" $item.ip
            if ($item.headers) {
                Write-Host "  Content-Type:" $item.headers.'content-type'
                if ($item.headers.server) {
                    Write-Host "  Server:" $item.headers.server
                }
            }
            
            # VirusTotal-Ergebnisse
            if ($item.virus_check) {
                if ($item.virus_check.error) {
                    Write-Host "  VirusTotal:" $item.virus_check.error -ForegroundColor Yellow
                } else {
                    $malicious = $item.virus_check.malicious
                    $suspicious = $item.virus_check.suspicious
                    Write-Host "  VirusTotal:" -NoNewline
                    Write-Host " Bösartig=$malicious, Verdächtig=$suspicious" -ForegroundColor $(
                        if ($malicious -gt 0) { "Red" }
                        elseif ($suspicious -gt 0) { "Yellow" }
                        else { "Green" }
                    )
                    Write-Host "    Bericht:" $item.virus_check.permalink
                }
            }

            # Fehler anzeigen (falls vorhanden)
            if ($item.error) {
                Write-Host "  Fehler:" $item.error -ForegroundColor Red
            }
        }
    } else {
        Write-Error "❌ Unerwartete Antwortstruktur!"
        $response | ConvertTo-Json -Depth 3
    }
}
catch {
    $errorDetails = $_.Exception.Message
    Write-Host "`n❌ Anfrage fehlgeschlagen!" -ForegroundColor Red
    Write-Host "Details: $errorDetails" -ForegroundColor Red
    
    # Prüfe, ob der Server läuft
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET
        Write-Host "ℹ️ Server-Status: Erreichbar (/health antwortet)" -ForegroundColor Green
    } catch {
        Write-Host "ℹ️ Server-Status: Nicht erreichbar (Port 8000)" -ForegroundColor Yellow
        Write-Host "→ Bitte starte das Backend mit 'npm start' im backend-Ordner" -ForegroundColor Yellow
    }
}