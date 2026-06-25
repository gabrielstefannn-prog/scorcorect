const { PrismaClient } = require('@prisma/client');
const footballApi = require('../services/footballApi');

const prisma = new PrismaClient();

exports.getMatches = async (req, res) => {
  try {
    const matches = await prisma.match.findMany({ orderBy: { matchDate: 'asc' } });
    res.json(matches);
  } catch (e) {
    res.status(500).json({ error: 'Eroare la încărcarea meciurilor' });
  }
};

exports.getMatch = async (req, res) => {
  const { id } = req.params;
  try {
    const match = await prisma.match.findUnique({ where: { id: parseInt(id) } });
    if (!match) return res.status(404).json({ error: 'Meciul nu există' });

    let liveData = null;
    if (match.apiMatchId && (match.status === 'LIVE' || match.status === 'SCHEDULED')) {
      liveData = await footballApi.getMatchDetails(match.apiMatchId);
    }

    res.json({ ...match, liveData });
  } catch (e) {
    res.status(500).json({ error: 'Eroare la încărcarea meciului' });
  }
};

exports.syncMatches = async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Acces interzis' });
  try {
    const fixtures = await footballApi.getFixtures();
    let created = 0, updated = 0;

    for (const f of fixtures) {
      const data = {
        apiMatchId: f.fixture.id,
        homeTeam: f.teams.home.name,
        awayTeam: f.teams.away.name,
        homeTeamCode: f.teams.home.id.toString(),
        awayTeamCode: f.teams.away.id.toString(),
        matchDate: new Date(f.fixture.date),
        group: f.league.round?.includes('Group') ? f.league.round : null,
        round: f.league.round || 'Group Stage',
        venue: f.fixture.venue?.name,
        status: mapStatus(f.fixture.status.short),
        homeScore: f.goals.home,
        awayScore: f.goals.away,
      };

      const existing = await prisma.match.findUnique({ where: { apiMatchId: f.fixture.id } });
      if (existing) {
        await prisma.match.update({ where: { apiMatchId: f.fixture.id }, data });
        updated++;
      } else {
        await prisma.match.create({ data });
        created++;
      }
    }

    res.json({ message: `Sincronizat: ${created} create, ${updated} actualizate` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

function mapStatus(apiStatus) {
  if (['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(apiStatus)) return 'LIVE';
  if (['FT', 'AET', 'PEN'].includes(apiStatus)) return 'FINISHED';
  if (['PST', 'CANC', 'ABD'].includes(apiStatus)) return 'CANCELLED';
  return 'SCHEDULED';
}
