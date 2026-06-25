const axios = require('axios');

const api = axios.create({
  baseURL: `https://${process.env.FOOTBALL_API_HOST}`,
  headers: {
    'x-rapidapi-key': process.env.FOOTBALL_API_KEY,
    'x-rapidapi-host': process.env.FOOTBALL_API_HOST,
  },
  timeout: 10000,
});

const cache = new Map();
const CACHE_TTL = {
  fixtures: 3600000,    // 1 ora
  live: 60000,          // 1 minut
  finished: Infinity,
  lineups: 3600000,
  statistics: 3600000,
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

exports.getFixtures = async () => {
  const key = 'fixtures';
  const cached = getCache(key);
  if (cached) return cached;

  const { data } = await api.get('/fixtures', {
    params: {
      league: process.env.WORLD_CUP_LEAGUE_ID,
      season: process.env.WORLD_CUP_SEASON,
    },
  });

  const fixtures = data.response || [];
  setCache(key, fixtures, CACHE_TTL.fixtures);
  return fixtures;
};

exports.getLiveFixtures = async () => {
  const key = 'live_fixtures';
  const cached = getCache(key);
  if (cached) return cached;

  const { data } = await api.get('/fixtures', {
    params: {
      league: process.env.WORLD_CUP_LEAGUE_ID,
      season: process.env.WORLD_CUP_SEASON,
      live: 'all',
    },
  });

  const fixtures = data.response || [];
  setCache(key, fixtures, CACHE_TTL.live);
  return fixtures;
};

exports.getMatchDetails = async (apiMatchId) => {
  const key = `match_${apiMatchId}`;
  const cached = getCache(key);
  if (cached) return cached;

  const [fixtureRes, lineupsRes, statsRes, eventsRes] = await Promise.allSettled([
    api.get('/fixtures', { params: { id: apiMatchId } }),
    api.get('/fixtures/lineups', { params: { fixture: apiMatchId } }),
    api.get('/fixtures/statistics', { params: { fixture: apiMatchId } }),
    api.get('/fixtures/events', { params: { fixture: apiMatchId } }),
  ]);

  const result = {
    fixture: fixtureRes.status === 'fulfilled' ? fixtureRes.value.data.response[0] : null,
    lineups: lineupsRes.status === 'fulfilled' ? lineupsRes.value.data.response : [],
    statistics: statsRes.status === 'fulfilled' ? statsRes.value.data.response : [],
    events: eventsRes.status === 'fulfilled' ? eventsRes.value.data.response : [],
  };

  const status = result.fixture?.fixture?.status?.short;
  const isFinished = ['FT', 'AET', 'PEN'].includes(status);
  setCache(key, result, isFinished ? CACHE_TTL.finished : CACHE_TTL.live);

  return result;
};
