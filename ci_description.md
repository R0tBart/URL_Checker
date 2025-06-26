# Erklärung der GitHub Actions Workflow-Datei `ci.yml`

Diese Datei automatisiert den CI-Prozess für dein Projekt, indem sie bei jedem Push oder Pull Request den Build deiner Container-Images durchführt.

---

## 🔧 Trigger

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

Der Workflow wird automatisch ausgelöst, wenn Code in den `main`-Branch gepusht wird oder ein Pull Request auf `main` geöffnet wird.

---

## 🧱 Job-Definition

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
```

Definiert einen Job namens `build`, der auf einem Ubuntu-Runner ausgeführt wird.

---

## 🚀 Schritte im Build

### 1. Repository klonen

```yaml
- uses: actions/checkout@v3
```
Lädt den Quellcode des Repositories auf den Build-Server.

### 2. Backend-Image bauen

```yaml
- run: docker build -t urlchecker-backend ./backend
```
Baut das Docker-Image für das Backend mit dem `Dockerfile` im `./backend`-Verzeichnis.

### 3. Frontend-Image bauen

```yaml
- run: docker build -t urlchecker-frontend ./frontend
```
Baut das Docker-Image für das Frontend mit dem `Dockerfile` im `./frontend`-Verzeichnis.

### 4. Backend-Container testen (optional)

```yaml
- run: docker run --rm -d -p 8000:8000 urlchecker-backend
```
Startet das Backend-Image im Container, um zu prüfen, ob es fehlerfrei läuft.

---

## 📝 Erweiterungsmöglichkeiten

- ✅ Unit-Tests mit `npm test`
- 📤 Docker Hub Deployment
- 🔐 Secrets für sichere Logins

---

## 📂 Speicherort im Repo

Die Datei muss liegen unter:

```
.github/workflows/ci.yml
```

Nur dann wird sie von GitHub Actions erkannt.