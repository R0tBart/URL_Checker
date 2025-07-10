# Dockerfile für das gesamte Projekt (Backend + statisches Frontend)
FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/. .

EXPOSE 8080
ENV PORT=8080

CMD ["node", "index.js"]