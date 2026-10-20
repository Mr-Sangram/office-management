/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);
const LIVE_DB_PATH = path.resolve(process.cwd(), '.erp_live_db.json');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS & No-Cache Headers for API
app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Routes
app.get('/api/short-links', (req, res) => {
  const PUBLIC_SHARED_APP_URL =
    'https://ais-pre-qocoiluztea3kp4jpja5xz-260768458257.asia-northeast1.run.app';
  res.json({
    workShortLink: PUBLIC_SHARED_APP_URL,
    clientShortLink: `${PUBLIC_SHARED_APP_URL}/?view=client`,
  });
});

app.get('/api/download-github-zip', (req, res) => {
  const zipPath = path.resolve(process.cwd(), 'public/advance-erp-github-ready.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="advance-erp-github-ready.zip"');
    return fs.createReadStream(zipPath).pipe(res);
  }
  return res.status(404).json({ status: 'error', message: 'Zip file not found' });
});

app.get('/advance-erp-github-ready.zip', (req, res) => {
  const zipPath = path.resolve(process.cwd(), 'public/advance-erp-github-ready.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="advance-erp-github-ready.zip"');
    return fs.createReadStream(zipPath).pipe(res);
  }
  res.status(404).send('ZIP file not found');
});

app.get('/api/live-db', (req, res) => {
  try {
    if (fs.existsSync(LIVE_DB_PATH)) {
      const raw = fs.readFileSync(LIVE_DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return res.json({ status: 'ok', exists: true, data: parsed });
    }
    return res.json({ status: 'ok', exists: false, data: null });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err?.message || 'Read error' });
  }
});

app.post('/api/live-db', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ status: 'error', message: 'Empty payload' });
    }
    const payloadToSave = {
      ...payload,
      serverUpdatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(LIVE_DB_PATH, JSON.stringify(payloadToSave, null, 2));
    return res.json({
      status: 'ok',
      serverUpdatedAt: payloadToSave.serverUpdatedAt,
    });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err?.message || 'Save error' });
  }
});

const distPath = path.resolve(__dirname, 'dist');
const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(distPath);

async function startServer() {
  if (!isProd) {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built static files from dist
    app.use(express.static(distPath, { maxAge: '1d' }));

    // SPA fallback: render index.html for all non-API GET requests
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (Mode: ${isProd ? 'Production' : 'Development'})`);
  });
}

startServer();
