const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MINUTES_BEFORE_LOCK = 10;

function canPredict(matchDate) {
  const now = new Date();
  const lockTime = new Date(matchDate.getTime() - MINUTES_BEFORE_LOCK * 60 * 1000);
  return now < lockTime;
}

function calculatePoints(prediction, match) {
  if (match.homeScore === null || match.awayScore === null) return null;

  // Scor exact = 3 puncte (ne-cumulabil)
  if (prediction.predictedHomeScore !== null && prediction.predictedAwayScore !== null) {
    if (prediction.predictedHomeScore === match.homeScore && prediction.predictedAwayScore === match.awayScore) {
      return 3;
    }
  }

  // Câștigătoare / egal = 1 punct
  const actualWinner = match.homeScore > match.awayScore ? 'HOME' : match.awayScore > match.homeScore ? 'AWAY' : 'DRAW';
  if (prediction.predictedWinner === actualWinner) return 1;

  return 0;
}

exports.upsertPrediction = async (req, res) => {
  const { matchId, predictedWinner, predictedHomeScore, predictedAwayScore } = req.body;
  const userId = req.user.id;

  try {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return res.status(404).json({ error: 'Meciul nu există' });
    if (!canPredict(match.matchDate)) return res.status(400).json({ error: 'Pronosticurile sunt blocate (mai puțin de 10 minute până la meci)' });
    if (match.status !== 'SCHEDULED') return res.status(400).json({ error: 'Meciul a început sau s-a terminat' });

    // Validare: dacă pui scor, verificăm că predictedWinner se potrivește cu scorul
    let winner = predictedWinner;
    if (predictedHomeScore !== null && predictedHomeScore !== undefined &&
        predictedAwayScore !== null && predictedAwayScore !== undefined) {
      if (predictedHomeScore > predictedAwayScore) winner = 'HOME';
      else if (predictedAwayScore > predictedHomeScore) winner = 'AWAY';
      else winner = 'DRAW';
    }

    const prediction = await prisma.prediction.upsert({
      where: { userId_matchId: { userId, matchId } },
      update: { predictedWinner: winner, predictedHomeScore, predictedAwayScore, points: null },
      create: { userId, matchId, predictedWinner: winner, predictedHomeScore, predictedAwayScore },
      include: { match: true },
    });

    res.json(prediction);
  } catch (e) {
    res.status(500).json({ error: 'Eroare la salvarea pronosticului' });
  }
};

exports.getMatchPredictions = async (req, res) => {
  const matchId = parseInt(req.params.matchId);
  try {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return res.status(404).json({ error: 'Meciul nu există' });

    const predictions = await prisma.prediction.findMany({
      where: { matchId },
      include: { user: { select: { id: true, username: true } } },
      orderBy: { user: { username: 'asc' } },
    });

    // Ascunde pronosticurile până când meciul a început sau s-a terminat
    const matchStarted = match.status !== 'SCHEDULED' || !canPredict(match.matchDate);

    const result = predictions.map(p => ({
      ...p,
      predictedWinner: matchStarted ? p.predictedWinner : (p.userId === req.user.id ? p.predictedWinner : null),
      predictedHomeScore: matchStarted ? p.predictedHomeScore : (p.userId === req.user.id ? p.predictedHomeScore : null),
      predictedAwayScore: matchStarted ? p.predictedAwayScore : (p.userId === req.user.id ? p.predictedAwayScore : null),
    }));

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Eroare' });
  }
};

exports.getUserPredictions = async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const predictions = await prisma.prediction.findMany({
      where: { userId },
      include: { match: true },
      orderBy: { match: { matchDate: 'asc' } },
    });
    res.json(predictions);
  } catch (e) {
    res.status(500).json({ error: 'Eroare' });
  }
};

exports.calculateAllPoints = async () => {
  const finishedMatches = await prisma.match.findMany({
    where: { status: 'FINISHED', homeScore: { not: null } },
    include: { predictions: true },
  });

  for (const match of finishedMatches) {
    for (const prediction of match.predictions) {
      if (prediction.points === null) {
        const points = calculatePoints(prediction, match);
        await prisma.prediction.update({ where: { id: prediction.id }, data: { points } });
      }
    }
  }
};
