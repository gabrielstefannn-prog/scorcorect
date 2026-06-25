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
      // Sărim meciurile fără echipe determinate (faze eliminatorii viitoare)
      if (!f.homeTeam?.name || !f.awayTeam?.name) continue;

      const homeScore = f.score?.fullTime?.home ?? null;
      const awayScore = f.score?.fullTime?.away ?? null;

      const data = {
        apiMatchId: f.id,
        homeTeam: f.homeTeam.name,
        awayTeam: f.awayTeam.name,
        homeTeamCode: f.homeTeam.tla || f.homeTeam.id?.toString() || 'UNK',
        awayTeamCode: f.awayTeam.tla || f.awayTeam.id?.toString() || 'UNK',
        matchDate: new Date(f.utcDate),
        group: f.group || null,
        round: f.stage || 'GROUP_STAGE',
        venue: null,
        status: mapStatus(f.status),
        homeScore,
        awayScore,
      };

      const existing = await prisma.match.findUnique({ where: { apiMatchId: f.id } });
      if (existing) {
        await prisma.match.update({ where: { apiMatchId: f.id }, data });
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
