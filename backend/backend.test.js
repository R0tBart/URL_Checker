// ===============================
// Jest-Testdatei für das URL-Checker-Backend
// Diese Datei testet die wichtigsten API-Endpunkte und Validierungsregeln des Backends.
// ===============================

const request = require('supertest');
const express = require('express');
const { checkUrl } = require('./utils');

// Die Express-App wird aus index.js importiert, damit die Tests direkt gegen die laufende App ausgeführt werden können.
// Voraussetzung: In index.js muss 'module.exports = app;' am Ende stehen.
let app;
let server;
beforeAll((done) => {
  app = require('./index');
  server = app.listen(0, done); // Starte auf zufälligem freien Port
});
afterAll((done) => {
  server.close(done);
});

// Test-Suite für den /check-urls-Endpunkt
// Hier werden verschiedene Eingabefälle und Validierungen getestet
// (z.B. leeres Array, fehlendes Feld, ungültige URL, zu viele URLs, Erfolg)
describe('API /check-urls', () => {
  test('gibt Fehler bei leerem Array zurück', async () => {
    // Erwartet: Fehler 400, wenn das Array leer ist
    const res = await request(app)
      .post('/check-urls')
      .send({ urls: [] })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/darf nicht leer sein/i);
  });

  test('gibt Fehler bei fehlendem Feld "urls" zurück', async () => {
    // Erwartet: Fehler 400, wenn das Feld "urls" fehlt
    const res = await request(app)
      .post('/check-urls')
      .send({})
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/urls/);
  });

  test('gibt Fehler bei ungültiger URL zurück', async () => {
    // Erwartet: Fehler im Ergebnis, wenn eine ungültige URL gesendet wird
    // Hier wird auf den Fehlertext "ERR_BAD_REQUEST" geprüft, wie vom Backend geliefert
    const res = await request(app)
      .post('/check-urls')
      .send({ urls: ['htp://ungültig'] })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body.results[0].error).toMatch(/ERR_BAD_REQUEST/i);
  });

  test('gibt Ergebnisse für gültige URLs zurück', async () => {
    // Erwartet: Für eine gültige URL werden alle wichtigen Felder im Ergebnisobjekt geliefert
    const res = await request(app)
      .post('/check-urls')
      .send({ urls: ['https://example.com'] })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body.results[0]).toHaveProperty('url', 'https://example.com');
    expect(res.body.results[0]).toHaveProperty('status_code');
    expect(res.body.results[0]).toHaveProperty('virus_check');
  });

  test('gibt Fehler bei mehr als 50 URLs zurück', async () => {
    // Erwartet: Fehler 400, wenn mehr als 50 URLs gesendet werden
    const urls = Array(51).fill('https://example.com');
    const res = await request(app)
      .post('/check-urls')
      .send({ urls })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/maximal 50/i);
  });
});

// Test-Suite für den /health-Endpunkt
// Prüft, ob der Server einen OK-Status zurückliefert
describe('API /health', () => {
  test('liefert Status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});