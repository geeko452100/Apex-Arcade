import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import gamesRoutes from './routes/games.js';
import matchmakingRoutes from './routes/matchmaking.js';
import statsRoutes from './routes/stats.js';
import idleRoutes from './routes/idle.js';
import puzzleRoutes from './routes/puzzle.js';
import leaderboardRoutes from './routes/leaderboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/matchmaking', matchmakingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/idle', idleRoutes);
app.use('/api/puzzle', puzzleRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

app.get('/{*path}', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
