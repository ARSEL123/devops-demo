const express = require('express');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Métriques Prometheus
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestsTotal);

// Middleware pour compter les requêtes
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.path,
      status_code: res.statusCode,
    });
  });
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'API DevOps Demo - OK',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.get('/api/items', (req, res) => {
  res.json({
    items: [
      { id: 1, name: 'Item A', value: 100 },
      { id: 2, name: 'Item B', value: 200 },
      { id: 3, name: 'Item C', value: 300 },
    ],
  });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;