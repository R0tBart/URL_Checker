# Erweiterte Funktionen in utils.js

| Zeile(n)   | Funktion                   | Beschreibung                                                                 |
|------------|----------------------------|------------------------------------------------------------------------------|
| 1          | dotenv.config()            | Lädt Umgebungsvariablen aus `.env`                                          |
| 7–8        | fs, path, chromium         | Für Dateihandling und Screenshots                                           |
| 11         | virusTotalApiKey           | Liest API-Key aus Umgebungsvariablen                                        |
| 13–29      | checkUrlVirusTotal()       | Fragt VirusTotal-API ab zur URL-Sicherheitsprüfung                          |
| 74–108     | checkUrl() (erweitert)     | Prüft zusätzlich Virustotal, IP, SSL, Header                                |
| 111–124    | getStats()                 | Berechnet Anzahl OK, Redirects, Durchschnittszeit, Statuscode-Verteilung    |
| 127–132    | exportCsv()                | Erstellt CSV-Text aus Ergebnissen                                           |
| 135–142    | getGeoIp(ip)               | Holt Standortdaten zur IP über ipapi.co                                     |
| 145–155    | takeScreenshot(url)        | Erstellt Screenshot mit Playwright                                          |
| 158–162    | measureExecutionTime()     | Misst Ausführungszeit beliebiger async-Funktion                             |
| 165–171    | module.exports              | Exportiert alle erweiterten Funktionen                                      |