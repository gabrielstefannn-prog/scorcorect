const { PrismaClient } = require('@prisma/client');
const footballApi = require('./footballApi');
const { calculateAllPoints } = require('../controllers/predictionController');

const prisma = new PrismaClient();

function mapStatus(apiStatus) {
  if (['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(apiStatus)) return 'LIVE';
  if (['FT', 'AET', 'PEN'].includes(apiStatus)) return 'FINISHED';
  if (['PST', 'CANC', 'ABD'].includes(apiStatus)) return 'CANCELLED';
  return 'SCHEDULED';
}

exports.updateLiveMatches = async () => {
  const liveMatches = await prisma.match.findMany({ where: { status: 'LIVE' } });
  if (liveMatches.length === 0) return;

  const liveFixtures = await footballApi.getLiveFixtures();

  for (const fixture of liveFixtures) {
    const match = liveMatches.find(m => m.apiMatchId === fixture.fixture.id);
    if (!match) continue;

    await prisma.match.update({
      where: { id: match.id },
      data: {
        homeScore: fixture.goals.home ?? match.homeScore,
        awayScore: fixture.goals.away ?? match.awayScore,
        status: mapStatus(fixture.fixture.status.short),
      },
    });
  }
};

exports.updateFinishedMatches = async () => {
  const now = new Date();
  const recentMatches = await prisma.match.findMany({
    where: {
      status: { in: ['SCHEDULED', 'LIVE'] },
      matchDate: { lte: new Date(now.getTime() - 90 * 60 * 1000) },
      apiMatchId: { not: null },
    },
  });

  for (const match of recentMatches) {
    try {
      const details = await footballApi.getMatchDetails(match.apiMatchId);
      if (!details.fixture) continue;

      const status = mapStatus(details.fixture.fixture.status.short);
      await prisma.match.update({
        where: { id: match.id },
        data: {
          status,
          homeScore: details.fixture.goals.home ?? match.homeScore,
          awayScore: details.fixture.goals.away ?? match.awayScore,
        },
      });
    } catch (e) {
      console.error(`Eroare update meci ${match.id}:`, e.message);
    }
  }

  await calculateAllPoints();
};
