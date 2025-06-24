# Neue API-Routen in index.js

| Route                   | Methode | Beschreibung                                                              | Verwendete Funktion        |
|------------------------|---------|---------------------------------------------------------------------------|----------------------------|
| `/check-urls`          | POST    | Prüft eine Liste von URLs auf Status, IP, SSL, Redirects, VirusTotal     | checkUrl()                 |
| `/stats`               | GET     | Gibt Statistik über Statuscodes und Ladezeit zurück (für Chart.js)       | getStats()                 |
| `/export`              | GET     | Exportiert Ergebnisse als CSV-Datei                                       | exportCsv()                |
| `/geoip/:ip`           | GET     | Liefert Geo-IP-Informationen (Land, Stadt, Organisation) zu einer IP      | getGeoIp()                 |
| `/screenshot?url=...`  | GET     | Erstellt Screenshot einer Seite mit Playwright und sendet als Download    | takeScreenshot()           |