# Dockerfile für das Node.js-Backend mit Playwright

FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8000
CMD ["node", "index.js"]