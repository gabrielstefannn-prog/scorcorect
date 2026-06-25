require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const authRoutes = require('./routes/auth');
const matchRoutes = require('./routes/matches');
const predictionRoutes = require('./routes/predictions');
const leaderboardRoutes = require('./routes/leaderboard');
const { updateLiveMatches, updateFinishedMatches } = require('./services/matchUpdater');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Actualizare scoruri live la fiecare 60 secunde
cron.schedule('* * * * *', async () => {
  try { await updateLiveMatches(); } catch (e) { console.error('Cron live error:', e.message); }
});

// Actualizare meciuri terminate la fiecare 5 minute
cron.schedule('*/5 * * * *', async () => {
  try { await updateFinishedMatches(); } catch (e) { console.error('Cron finished error:', e.message); }
});

app.listen(PORT, () => console.log(`ScorCorect server running on port ${PORT}`));
