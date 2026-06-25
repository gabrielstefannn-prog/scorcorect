const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        predictions: {
          where: { points: { not: null } },
          select: { points: true, predictedWinner: true, predictedHomeScore: true, predictedAwayScore: true },
        },
      },
    });

    const leaderboard = users.map(u => {
      const totalPoints = u.predictions.reduce((sum, p) => sum + (p.points || 0), 0);
      const exactScores = u.predictions.filter(p => p.points === 3).length;
      const correctWinners = u.predictions.filter(p => p.points === 1).length;
      const totalPredictions = u.predictions.length;

      return {
        id: u.id,
        username: u.username,
        totalPoints,
        exactScores,
        correctWinners,
        totalPredictions,
      };
    });

    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints || b.exactScores - a.exactScores);

    res.json(leaderboard);
  } catch (e) {
    res.status(500).json({ error: 'Eroare la clasament' });
  }
};
