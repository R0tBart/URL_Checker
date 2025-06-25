# Dockerfile für das Node.js-Backend mit Playwright

# Basis-Image mit vorinstalliertem Chromium & Node.js
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

# Arbeitsverzeichnis im Container
WORKDIR /app

# Package-Dateien zuerst kopieren (für effizienteres Caching)
COPY backend/package*.json ./

# Abhängigkeiten installieren
RUN npm install

# Restliche Backend-Dateien kopieren
COPY backend/ .

# Port öffnen (Backend läuft auf Port 8000)
EXPOSE 8000

# Startbefehl
CMD ["node", "index.js"]