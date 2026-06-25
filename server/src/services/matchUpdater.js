const { PrismaClient } = require('@prisma/client');
const footballApi = require('./footballApi');
const { calculateAllPoints } = require('../controllers/predictionController');

const prisma = new PrismaClient();

exports.updateLiveMatches = async () => {
  const liveMatches = await prisma.match.findMany({ where: { status: 'LIVE' } });
  if (liveMatches.length === 0) return;

  const liveFixtures = await footballApi.getLiveFixtures();

  for (const fixture of liveFixtures) {
    const match = liveMatches.find(m => m.apiMatchId === fixture.id);
    if (!match) continue;

    await prisma.match.update({
      where: { id: match.id },
      data: {
        homeScore: fixture.score?.fullTime?.home ?? match.homeScore,
        awayScore: fixture.score?.fullTime?.away ?? match.awayScore,
        status: footballApi.mapStatus(fixture.status),
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

      const f = details.fixture;
      const status = footballApi.mapStatus(f.status);
      await prisma.match.update({
        where: { id: match.id },
        data: {
          status,
          homeScore: f.score?.fullTime?.home ?? match.homeScore,
          awayScore: f.score?.fullTime?.away ?? match.awayScore,
        },
      });
    } catch (e) {
      console.error(`Eroare update meci ${match.id}:`, e.message);
    }
  }

  await calculateAllPoints();
};
