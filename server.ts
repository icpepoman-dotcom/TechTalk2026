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
const IMAGES_DIR = path.join(__dirname, 'src', 'assets', 'images');
const PUBLIC_IMAGES_DIR = path.join(__dirname, 'public', 'images');
const DIST_IMAGES_DIR = path.join(__dirname, 'dist', 'images');

// Helper to save base64 data URLs to disk in src/assets/images/, public/images/, and dist/images/
function saveBase64Image(dataUrl: string, baseName: string): string | null {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return null;
  }
  try {
    if (!fs.existsSync(IMAGES_DIR)) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }
    if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
      fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
    }
    if (fs.existsSync(path.join(__dirname, 'dist')) && !fs.existsSync(DIST_IMAGES_DIR)) {
      fs.mkdirSync(DIST_IMAGES_DIR, { recursive: true });
    }
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
    if (!matches) return null;
    let ext = matches[1];
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';

    const cleanBase = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const fileName = `${cleanBase}.${ext}`;
    const filePath = path.join(IMAGES_DIR, fileName);
    const publicFilePath = path.join(PUBLIC_IMAGES_DIR, fileName);
    const buffer = Buffer.from(matches[2], 'base64');
    fs.writeFileSync(filePath, buffer);
    fs.writeFileSync(publicFilePath, buffer);
    if (fs.existsSync(DIST_IMAGES_DIR)) {
      fs.writeFileSync(path.join(DIST_IMAGES_DIR, fileName), buffer);
    }
    console.log(`[Disk Sync] Saved image to disk: ${fileName} (${buffer.length} bytes) in images folders`);
    return `./images/${fileName}`;
  } catch (err) {
    console.error(`[Disk Sync Error] Failed to save image ${baseName}:`, err);
    return null;
  }
}

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

// POST save site state (automatically extracts base64 and writes real image files to src/assets/images/)
app.post('/api/site-data', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }

    let savedImagesCount = 0;

    // 1. Extract and write customImages directly to src/assets/images/
    if (payload.customImages && typeof payload.customImages === 'object') {
      for (const [slotId, slotVal] of Object.entries(payload.customImages)) {
        if (slotVal && typeof slotVal === 'object') {
          const item = slotVal as any;
          if (item.customUrl && item.customUrl.startsWith('data:image/')) {
            const diskPath = saveBase64Image(item.customUrl, `slot_${slotId}`);
            if (diskPath) {
              item.customUrl = diskPath;
              savedImagesCount++;
            }
          }
        }
      }
    }

    // 2. Extract and write speakers photos directly to src/assets/images/
    if (Array.isArray(payload.speakers)) {
      for (const spk of payload.speakers) {
        if (spk && spk.photoUrl && spk.photoUrl.startsWith('data:image/')) {
          const safeName = spk.name ? spk.name.replace(/[^a-zA-Z0-9]/g, '_') : spk.id;
          const diskPath = saveBase64Image(spk.photoUrl, `speaker_${safeName}`);
          if (diskPath) {
            spk.photoUrl = diskPath;
            savedImagesCount++;
          }
        }
      }
    }

    // 3. Extract and write QR code image if custom
    if (payload.eventDetails?.qrCodeCustomUrl && payload.eventDetails.qrCodeCustomUrl.startsWith('data:image/')) {
      const diskPath = saveBase64Image(payload.eventDetails.qrCodeCustomUrl, 'qr_code_registration');
      if (diskPath) {
        payload.eventDetails.qrCodeCustomUrl = diskPath;
        savedImagesCount++;
      }
    }

    // 4. Extract and write collaborator logos if base64
    if (Array.isArray(payload.collaboratingOrgs)) {
      for (let i = 0; i < payload.collaboratingOrgs.length; i++) {
        const org = payload.collaboratingOrgs[i];
        if (org && org.logo && typeof org.logo === 'string' && org.logo.startsWith('data:image/')) {
          const safeName = (org.shortName || org.id || `partner_${i}`).replace(/[^a-zA-Z0-9]/g, '_');
          const diskPath = saveBase64Image(org.logo, `partner_${safeName}`);
          if (diskPath) {
            org.logo = diskPath;
            savedImagesCount++;
          }
        }
      }
    }

    // 5. Save state file with clean file references
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');

    return res.json({
      success: true,
      message: `Website state saved. ${savedImagesCount} pictures updated in images folders (src/assets/images and public/images).`,
      savedImagesCount
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: errorMessage });
  }
});

// Dedicated direct image upload endpoint
app.post('/api/save-image', (req, res) => {
  try {
    const { id, name, dataUrl } = req.body;
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return res.status(400).json({ success: false, error: 'Valid dataUrl is required' });
    }
    const baseName = name || id || `image_${Date.now()}`;
    const diskPath = saveBase64Image(dataUrl, baseName);
    if (!diskPath) {
      return res.status(500).json({ success: false, error: 'Failed to write image to disk' });
    }
    return res.json({ success: true, filePath: diskPath, message: 'Image successfully saved to images folder' });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: errorMessage });
  }
});

// GitHub Delivery endpoint: commits and pushes site_state.json directly to GitHub repository
app.post('/api/github-sync', async (req, res) => {
  try {
    const { owner, repo, branch = 'main', token, siteState, commitMessage } = req.body;
    if (!owner || !repo || !token) {
      return res.status(400).json({ success: false, error: 'owner, repo, and token are required for GitHub sync' });
    }

    // 1. First ensure disk state file is written
    if (siteState && typeof siteState === 'object') {
      const dataDir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(siteState, null, 2), 'utf-8');
    }

    const cleanOwner = String(owner).trim();
    const cleanRepo = String(repo).trim();
    const cleanBranch = String(branch).trim();
    const cleanToken = String(token).trim();
    const targetPath = 'src/data/site_state.json';

    // 2. Fetch existing file SHA
    let existingSha: string | undefined;
    const getRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${targetPath}?ref=${cleanBranch}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${cleanToken}`
      }
    });

    if (getRes.ok) {
      const existing = (await getRes.json()) as any;
      existingSha = existing.sha;
    }

    // 3. Encode site_state.json content
    const contentStr = fs.existsSync(DATA_FILE)
      ? fs.readFileSync(DATA_FILE, 'utf-8')
      : JSON.stringify(siteState || {}, null, 2);
    const base64Content = Buffer.from(contentStr, 'utf-8').toString('base64');

    const nowStr = new Date().toLocaleString();
    const msg = commitMessage || `Update conference site state from Admin Control Panel [${nowStr}]`;

    // 4. PUT file to GitHub Contents API
    const putRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${targetPath}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: msg,
        content: base64Content,
        sha: existingSha,
        branch: cleanBranch
      })
    });

    if (!putRes.ok) {
      const errData = (await putRes.json().catch(() => ({}))) as any;
      const detail = errData.message || `HTTP ${putRes.status} ${putRes.statusText}`;
      return res.status(putRes.status).json({ success: false, error: detail });
    }

    const putData = (await putRes.json()) as any;
    const commitSha = putData.commit?.sha || putData.content?.sha;
    const commitUrl = putData.commit?.html_url || `https://github.com/${cleanOwner}/${cleanRepo}/commit/${commitSha}`;

    return res.json({
      success: true,
      message: `Successfully delivered changes to GitHub repository ${cleanOwner}/${cleanRepo}! Deployment triggered.`,
      commitUrl,
      sha: commitSha
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: errorMessage });
  }
});

// GET list of images in src/assets/images/
app.get('/api/list-images', (_req, res) => {
  try {
    if (fs.existsSync(IMAGES_DIR)) {
      const files = fs.readdirSync(IMAGES_DIR).map((fn) => {
        const stat = fs.statSync(path.join(IMAGES_DIR, fn));
        return {
          name: fn,
          path: `/src/assets/images/${fn}`,
          sizeBytes: stat.size,
          modified: stat.mtime
        };
      });
      return res.json({ success: true, count: files.length, files });
    }
    return res.json({ success: true, count: 0, files: [] });
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
