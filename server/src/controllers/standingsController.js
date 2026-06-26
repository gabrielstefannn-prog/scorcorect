const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getStandings = async (req, res) => {
  try {
    const allGroupMatches = await prisma.match.findMany({
      where: { group: { startsWith: 'GROUP' } },
    });

    const groups = {};

    allGroupMatches.forEach(m => {
      if (!groups[m.group]) groups[m.group] = {};

      if (!groups[m.group][m.homeTeam]) {
        groups[m.group][m.homeTeam] = {
          name: m.homeTeam, tla: m.homeTeamCode,
          played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, points: 0,
        };
      }
      if (!groups[m.group][m.awayTeam]) {
        groups[m.group][m.awayTeam] = {
          name: m.awayTeam, tla: m.awayTeamCode,
          played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, points: 0,
        };
      }

      if (m.status === 'FINISHED' && m.homeScore !== null && m.awayScore !== null) {
        const home = groups[m.group][m.homeTeam];
        const away = groups[m.group][m.awayTeam];

        home.played++; away.played++;
        home.gf += m.homeScore; home.ga += m.awayScore;
        away.gf += m.awayScore; away.ga += m.homeScore;

        if (m.homeScore > m.awayScore) {
          home.won++; home.points += 3; away.lost++;
        } else if (m.homeScore < m.awayScore) {
          away.won++; away.points += 3; home.lost++;
        } else {
          home.draw++; home.points++; away.draw++; away.points++;
        }
      }
    });

    const standings = Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([groupName, teams]) => ({
        group: groupName,
        table: Object.values(teams)
          .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const gdA = a.gf - a.ga, gdB = b.gf - b.ga;
            if (gdB !== gdA) return gdB - gdA;
            return b.gf - a.gf;
          })
          .map((t, idx) => ({
            position: idx + 1,
            team: { name: t.name, tla: t.tla, shortName: t.name },
            playedGames: t.played,
            won: t.won,
            draw: t.draw,
            lost: t.lost,
            points: t.points,
          })),
      }));

    res.json(standings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
