# Test-URLs definieren
$urls = @(
    "https://example.com",
    "http://google.com",
    "https://github.com"
)

# JSON-Body erstellen
$body = @{ urls = $urls } | ConvertTo-Json -Depth 2

# Anfrage senden
try {
    $response = Invoke-RestMethod `
        -Uri "http://localhost:8000/check-urls" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"

    # Ergebnis ausgeben
    if ($response.results -is [System.Array]) {
        Write-Host "`n✅ Backend-Antwort OK:"
        foreach ($item in $response.results) {
            Write-Host "URL:" $item.url
            Write-Host "  Status:" $item.status_code
            Write-Host "  Ladezeit:" $item.response_time "ms"
            Write-Host "  SSL gültig:" $item.ssl_valid
            Write-Host "  Redirect:" $item.redirect
            Write-Host "  IP:" $item.ip
            Write-Host ""
        }
    } else {
        Write-Error "❌ Unerwartete Antwortstruktur!"
        $response | ConvertTo-Json -Depth 3
    }
}
catch {
    Write-Error "❌ Anfrage fehlgeschlagen: $($_.Exception.Message)"
}
