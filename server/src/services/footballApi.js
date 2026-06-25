const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.football-data.org/v4',
  headers: {
    'X-Auth-Token': process.env.FOOTBALL_API_KEY,
  },
  timeout: 10000,
});

const cache = new Map();
const CACHE_TTL = {
  fixtures: 3600000,
  live: 60000,
  finished: Infinity,
  lineups: 3600000,
};

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key, data, ttl) {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

function mapStatus(status) {
  if (['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(status)) return 'LIVE';
  if (['FINISHED', 'AWARDED'].includes(status)) return 'FINISHED';
  if (['POSTPONED', 'CANCELLED', 'SUSPENDED'].includes(status)) return 'CANCELLED';
  return 'SCHEDULED';
}

exports.getFixtures = async () => {
  const key = 'fixtures';
  const cached = getCache(key);
  if (cached) return cached;

  const competition = process.env.FOOTBALL_COMPETITION || 'WC';
  const season = process.env.WORLD_CUP_SEASON || '2026';

  const { data } = await api.get(`/competitions/${competition}/matches`, {
    params: { season },
  });

  const fixtures = data.matches || [];
  setCache(key, fixtures, CACHE_TTL.fixtures);
  return fixtures;
};

exports.getLiveFixtures = async () => {
  const key = 'live_fixtures';
  const cached = getCache(key);
  if (cached) return cached;

  const competition = process.env.FOOTBALL_COMPETITION || 'WC';
  const { data } = await api.get(`/competitions/${competition}/matches`, {
    params: { status: 'IN_PLAY,PAUSED,HALFTIME' },
  });

  const fixtures = data.matches || [];
  setCache(key, fixtures, CACHE_TTL.live);
  return fixtures;
};

exports.getMatchDetails = async (apiMatchId) => {
  const key = `match_${apiMatchId}`;
  const cached = getCache(key);
  if (cached) return cached;

  const { data } = await api.get(`/matches/${apiMatchId}`);
  const match = data;

  const isFinished = ['FINISHED', 'AWARDED'].includes(match.status);

  const result = {
    fixture: match,
    lineups: match.lineups || [],
    statistics: [],
    events: (match.goals || []).map(g => ({
      type: 'Goal',
      time: { elapsed: g.minute },
      team: { name: g.team?.name },
      player: { name: g.scorer?.name || 'Unknown' },
    })),
  };

  setCache(key, result, isFinished ? CACHE_TTL.finished : CACHE_TTL.live);
  return result;
};

exports.mapStatus = mapStatus;
