import app from './api/index';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import express from 'express';

const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log('Spawning Vite Development Server middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving production static bundle assets from /dist...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Poultry Guardian AI full-stack server online on Port http://localhost:${PORT}`);
  });
}

startServer();
