# ReadMe für das Frontend

Dieses Frontend bildet die Benutzeroberfläche für den URL-Checker. Es ermöglicht Benutzern die einfache Interaktion mit dem Backend, um eine oder mehrere URLs zu überprüfen und die Ergebnisse übersichtlich darzustellen.

## Technologien
*   **HTML5**: Für die grundlegende Struktur der Webseite.
*   **CSS3**: Für das Styling und das Layout der Benutzeroberfläche.
*   **JavaScript (Vanilla)**: Für die Anwendungslogik, die Interaktion mit dem Benutzer und die Kommunikation mit dem Backend.

## Dateistruktur
*   `index.html`: Enthält das HTML-Markup für die Hauptseite.
*   `style.css`: Beinhaltet alle CSS-Regeln für das Design der Seite.
*   `scripts.js`: Steuert die dynamischen Aspekte der Seite, wie das Senden von Anfragen an das Backend und das Anzeigen der Ergebnisse.
*   `image/`: Ordner für die auf der Seite verwendeten Bilder.

## Ausführung
Um das Frontend zu nutzen, müssen folgende Schritte ausgeführt werden:

1.  **Backend starten**: Stelle sicher, dass der [Backend-Server](../backend/readMe_BACKEND.md) läuft. Standardmäßig ist dieser unter `http://localhost:8000` erreichbar.
2.  **HTML-Datei öffnen**: Öffne die `index.html` in einem modernen Webbrowser (z.B. Chrome, Firefox, Edge).

## Benutzung
1.  Gib eine oder mehrere URLs in das dafür vorgesehene Textfeld ein. Mehrere URLs müssen durch Kommas oder Zeilenumbrüche getrennt werden.
2.  Klicke auf den "Überprüfen"-Button, um die Analyse zu starten.
3.  Die Ergebnisse für jede URL werden in einer Tabelle unterhalb des Eingabefeldes angezeigt.

## Verbindung zum Backend
Das Frontend kommuniziert über eine `POST`-Anfrage mit dem `/check-urls`-Endpunkt des Backends. Die URL des Backends (`http://localhost:8000`) ist in der `scripts.js`-Datei festgelegt. Falls das Backend auf einem anderen Port oder einer anderen Adresse läuft, muss dies in der `scripts.js` angepasst werden. 