# Production Dockerfile für Node.js Backend mit statischem Frontend
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Port für das Backend (kann per ENV überschrieben werden)
EXPOSE 8080
ENV PORT=8080

CMD ["node", "index.js"]