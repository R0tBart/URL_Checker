# Multi-URL Checker Dashboard – Docker Setup

Dieses Projekt besteht aus einem **Node.js-Backend** (Express + Playwright) und einem **statischen HTML-Frontend**.

---

## 🚀 Schnellstart mit Docker

### Voraussetzungen

- Docker & Docker Compose installiert

---

### 📦 Projektstruktur

```
URL_Checker/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── index.js, utils.js, ...
├── frontend/
│   ├── Dockerfile
│   ├── index.html, scripts.js, style.css
├── docker-compose.yml
```

---

### 🔧 Container bauen

```bash
docker-compose build
```

---

### ▶️ App starten

```bash
docker-compose up
```

---

### 🌐 Aufruf im Browser

- **Frontend:** http://localhost:8080  
- **Backend API:** http://localhost:8000

---

## 📄 Nützliche Befehle

Container stoppen:

```bash
docker-compose down
```

Neustarten mit Live-Code:

```bash
docker-compose up --build
```

---

## ℹ️ Hinweise

- Das Backend nutzt `mcr.microsoft.com/playwright` mit Chromium für Screenshots.
- `.env`-Datei (falls benötigt) wird durch `.dockerignore` geschützt.