import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High payload limit for base64 compressed images and JSON backups
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_FILE = path.join(__dirname, 'src', 'data', 'site_state.json');

// GET saved site state
app.get('/api/site-data', (_req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return res.json({ success: true, saved: true, data });
    }
    return res.json({ success: true, saved: false, message: 'No server state stored yet, using defaults' });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: errorMessage });
  }
});

// POST save site state (persists updates across all visitors & published instances)
app.post('/api/site-data', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    return res.json({ success: true, message: 'Website state saved to server storage successfully' });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: errorMessage });
  }
});

// Serve frontend: dev middleware or static dist
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const distDir = path.join(__dirname, 'dist');

  if (isProd && fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
