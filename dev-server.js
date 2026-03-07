// dev-server.js — Servidor local de desarrollo que emula Vercel
// Sirve las funciones de api/ y hace proxy al servidor de Vite para el frontend
// Uso: node dev-server.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { readdir } from 'fs/promises';
import { pathToFileURL } from 'url';
import path from 'path';

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
        if (data.ok) console.log('  ✅ Base de datos: tablas verificadas/creadas');
        else console.error('  ❌ Error al crear tablas:', data);
        return fakeRes;
      },
      end: () => fakeRes,
      setHeader: () => fakeRes,
    };
    await initHandler({ method: 'GET', query: {} }, fakeRes);
  } catch (err) {
    console.error('  ❌ No se pudo conectar a la BD. Verifica DATABASE_URL en .env');
    console.error('    ', err.message);
  }
}

// ── Cargar dinámicamente todos los handlers de api/*.js ─────────────────
const apiDir = path.resolve('./api');
const files  = await readdir(apiDir);

for (const file of files) {
  // Ignorar helpers que empiezan con "_" y el archivo vacío endpoint.js
  if (file.startsWith('_') || !file.endsWith('.js')) continue;

  const modulePath = pathToFileURL(path.join(apiDir, file)).href;
  const mod        = await import(modulePath);
  const handler    = mod.default;

  if (typeof handler !== 'function') continue;

  const routeName = '/' + file.replace('.js', '');
  const route     = `/api${routeName}`;

  app.all(route, (req, res) => {
    console.log(`[API] ${req.method} ${route}`);
    handler(req, res);
  });

  console.log(`  ✔ Montado: ${route}`);
}

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
  console.log(`\n🚀  Dev server arriba en http://localhost:${API_PORT}`);
  console.log(`   • API:      http://localhost:${API_PORT}/api/...`);
  console.log(`   • Frontend: http://localhost:${API_PORT}/ (proxy → Vite :${VITE_PORT})\n`);
  console.log('  ⏳ Verificando tablas en PostgreSQL...');
  await initDB();
});
