// dev-server.js — Servidor local de desarrollo que emula Vercel
// Sirve las funciones de api/ y hace proxy al servidor de Vite para el frontend
// Uso: node dev-server.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { pathToFileURL } from 'url';
import path from 'path';
import { existsSync } from 'fs';

const API_PORT  = 3001;
const VITE_PORT = 5173;

const app = express();
app.use(cors());
app.use(express.json());

// ── Auto-inicializar las tablas en BD al arrancar ───────────────────────
async function initDB() {
  try {
    const { default: initHandler } = await import(
      pathToFileURL(path.resolve('./api/init-db.js')).href
    );
    // Simular req/res para ejecutar el handler internamente
    const fakeRes = {
      status: () => fakeRes,
      json: (data) => {
        if (data.ok) console.log('  \u2705 Base de datos: tablas verificadas/creadas');
        else console.error('  \u274c Error al crear tablas:', data);
        return fakeRes;
      },
      end: () => fakeRes,
      setHeader: () => fakeRes,
    };
    await initHandler({ method: 'GET', query: {} }, fakeRes);
  } catch (err) {
    console.error('  \u274c No se pudo conectar a la BD. Verifica DATABASE_URL en .env');
    console.error('    ', err.message);
  }
}

// ── Router dinámico: carga el handler en cada request (hot-reload) ───────
//    Esto permite añadir nuevos archivos api/*.js sin reiniciar el server.
const apiDir = path.resolve('./api');

app.all('/api/:endpoint', async (req, res) => {
  const endpoint = req.params.endpoint;

  // Ignorar helpers internos
  if (endpoint.startsWith('_')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const filePath = path.join(apiDir, `${endpoint}.js`);

  if (!existsSync(filePath)) {
    console.warn(`[API] ⚠  Endpoint no encontrado: ${filePath}`);
    return res.status(404).json({ error: `Endpoint /api/${endpoint} no existe` });
  }

  try {
    // Cache-busting con query de timestamp → siempre re-importa el módulo actualizado
    const moduleUrl = `${pathToFileURL(filePath).href}?t=${Date.now()}`;
    const mod = await import(moduleUrl);
    const handler = mod.default;

    if (typeof handler !== 'function') {
      return res.status(500).json({ error: `El handler de /api/${endpoint} no exporta una función` });
    }

    console.log(`[API] ${req.method.padEnd(6)} /api/${endpoint}`);
    await handler(req, res);
  } catch (err) {
    console.error(`[API] \u274c Error en /api/${endpoint}:`, err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno del servidor', detail: err.message });
    }
  }
});

// ── Proxy todo lo demás a Vite ──────────────────────────────────────────
app.use(
  '/',
  createProxyMiddleware({
    target: `http://localhost:${VITE_PORT}`,
    changeOrigin: true,
    ws: true,
  })
);

// ── Arrancar servidor y luego inicializar BD ────────────────────────────
createServer(app).listen(API_PORT, async () => {
  console.log(`\n\ud83d\ude80  Dev server arriba en http://localhost:${API_PORT}`);
  console.log(`   \u2022 API:      http://localhost:${API_PORT}/api/...`);
  console.log(`   \u2022 Frontend: http://localhost:${API_PORT}/ (proxy \u2192 Vite :${VITE_PORT})\n`);
  console.log('   \u2139\ufe0f  Nuevos archivos api/*.js se detectan autom\u00e1ticamente (sin reiniciar).\n');
  console.log('  \u23f3 Verificando tablas en PostgreSQL...');
  await initDB();
});
