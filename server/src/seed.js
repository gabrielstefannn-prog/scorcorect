require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Meciuri Cupa Mondială 2026 - Faza Grupelor
// Toate orele sunt în UTC+3 (ora României)
const matches = [
  // GRUPA A
  { homeTeam: 'Mexic', awayTeam: 'Maroc', homeTeamCode: 'MX', awayTeamCode: 'MA', matchDate: '2026-06-11T22:00:00', group: 'Grupa A', round: 'Faza Grupelor', venue: 'SoFi Stadium, Los Angeles' },
  { homeTeam: 'SUA', awayTeam: 'Canada', homeTeamCode: 'US', awayTeamCode: 'CA', matchDate: '2026-06-12T01:00:00', group: 'Grupa A', round: 'Faza Grupelor', venue: 'MetLife Stadium, New York' },
  { homeTeam: 'SUA', awayTeam: 'Maroc', homeTeamCode: 'US', awayTeamCode: 'MA', matchDate: '2026-06-16T22:00:00', group: 'Grupa A', round: 'Faza Grupelor', venue: 'AT&T Stadium, Dallas' },
  { homeTeam: 'Canada', awayTeam: 'Mexic', homeTeamCode: 'CA', awayTeamCode: 'MX', matchDate: '2026-06-17T01:00:00', group: 'Grupa A', round: 'Faza Grupelor', venue: 'BC Place, Vancouver' },
  { homeTeam: 'Canada', awayTeam: 'Maroc', homeTeamCode: 'CA', awayTeamCode: 'MA', matchDate: '2026-06-22T01:00:00', group: 'Grupa A', round: 'Faza Grupelor', venue: 'BC Place, Vancouver' },
  { homeTeam: 'Mexic', awayTeam: 'SUA', homeTeamCode: 'MX', awayTeamCode: 'US', matchDate: '2026-06-22T01:00:00', group: 'Grupa A', round: 'Faza Grupelor', venue: 'Estadio Azteca, Mexico City' },

  // GRUPA B
  { homeTeam: 'Argentina', awayTeam: 'Albania', homeTeamCode: 'AR', awayTeamCode: 'AL', matchDate: '2026-06-13T22:00:00', group: 'Grupa B', round: 'Faza Grupelor', venue: 'MetLife Stadium, New York' },
  { homeTeam: 'Ucraina', awayTeam: 'Peru', homeTeamCode: 'UA', awayTeamCode: 'PE', matchDate: '2026-06-14T01:00:00', group: 'Grupa B', round: 'Faza Grupelor', venue: 'Levi\'s Stadium, San Francisco' },
  { homeTeam: 'Argentina', awayTeam: 'Ucraina', homeTeamCode: 'AR', awayTeamCode: 'UA', matchDate: '2026-06-18T22:00:00', group: 'Grupa B', round: 'Faza Grupelor', venue: 'Rose Bowl, Los Angeles' },
  { homeTeam: 'Peru', awayTeam: 'Albania', homeTeamCode: 'PE', awayTeamCode: 'AL', matchDate: '2026-06-19T01:00:00', group: 'Grupa B', round: 'Faza Grupelor', venue: 'NRG Stadium, Houston' },
  { homeTeam: 'Argentina', awayTeam: 'Peru', homeTeamCode: 'AR', awayTeamCode: 'PE', matchDate: '2026-06-23T01:00:00', group: 'Grupa B', round: 'Faza Grupelor', venue: 'MetLife Stadium, New York' },
  { homeTeam: 'Albania', awayTeam: 'Ucraina', homeTeamCode: 'AL', awayTeamCode: 'UA', matchDate: '2026-06-23T01:00:00', group: 'Grupa B', round: 'Faza Grupelor', venue: 'Gillette Stadium, Boston' },

  // GRUPA C
  { homeTeam: 'Spania', awayTeam: 'Columbia', homeTeamCode: 'ES', awayTeamCode: 'CO', matchDate: '2026-06-12T22:00:00', group: 'Grupa C', round: 'Faza Grupelor', venue: 'AT&T Stadium, Dallas' },
  { homeTeam: 'Serbia', awayTeam: 'Ungaria', homeTeamCode: 'RS', awayTeamCode: 'HU', matchDate: '2026-06-13T01:00:00', group: 'Grupa C', round: 'Faza Grupelor', venue: 'Lincoln Financial Field, Philadelphia' },
  { homeTeam: 'Spania', awayTeam: 'Ungaria', homeTeamCode: 'ES', awayTeamCode: 'HU', matchDate: '2026-06-17T22:00:00', group: 'Grupa C', round: 'Faza Grupelor', venue: 'MetLife Stadium, New York' },
  { homeTeam: 'Columbia', awayTeam: 'Serbia', homeTeamCode: 'CO', awayTeamCode: 'RS', matchDate: '2026-06-18T01:00:00', group: 'Grupa C', round: 'Faza Grupelor', venue: 'Levi\'s Stadium, San Francisco' },
  { homeTeam: 'Spania', awayTeam: 'Serbia', homeTeamCode: 'ES', awayTeamCode: 'RS', matchDate: '2026-06-22T22:00:00', group: 'Grupa C', round: 'Faza Grupelor', venue: 'AT&T Stadium, Dallas' },
  { homeTeam: 'Ungaria', awayTeam: 'Columbia', homeTeamCode: 'HU', awayTeamCode: 'CO', matchDate: '2026-06-22T22:00:00', group: 'Grupa C', round: 'Faza Grupelor', venue: 'Rose Bowl, Los Angeles' },

  // GRUPA D
  { homeTeam: 'Franta', awayTeam: 'Kenia', homeTeamCode: 'FR', awayTeamCode: 'KE', matchDate: '2026-06-13T19:00:00', group: 'Grupa D', round: 'Faza Grupelor', venue: 'Rose Bowl, Los Angeles' },
  { homeTeam: 'Panama', awayTeam: 'Mauritania', homeTeamCode: 'PA', awayTeamCode: 'MR', matchDate: '2026-06-14T04:00:00', group: 'Grupa D', round: 'Faza Grupelor', venue: 'BC Place, Vancouver' },
  { homeTeam: 'Franta', awayTeam: 'Panama', homeTeamCode: 'FR', awayTeamCode: 'PA', matchDate: '2026-06-18T19:00:00', group: 'Grupa D', round: 'Faza Grupelor', venue: 'Levi\'s Stadium, San Francisco' },
  { homeTeam: 'Mauritania', awayTeam: 'Kenia', homeTeamCode: 'MR', awayTeamCode: 'KE', matchDate: '2026-06-19T04:00:00', group: 'Grupa D', round: 'Faza Grupelor', venue: 'Arrowhead Stadium, Kansas City' },
  { homeTeam: 'Franta', awayTeam: 'Mauritania', homeTeamCode: 'FR', awayTeamCode: 'MR', matchDate: '2026-06-23T22:00:00', group: 'Grupa D', round: 'Faza Grupelor', venue: 'MetLife Stadium, New York' },
  { homeTeam: 'Kenia', awayTeam: 'Panama', homeTeamCode: 'KE', awayTeamCode: 'PA', matchDate: '2026-06-23T22:00:00', group: 'Grupa D', round: 'Faza Grupelor', venue: 'Arrowhead Stadium, Kansas City' },

  // GRUPA E
  { homeTeam: 'Germania', awayTeam: 'Arabia Saudita', homeTeamCode: 'DE', awayTeamCode: 'SA', matchDate: '2026-06-14T22:00:00', group: 'Grupa E', round: 'Faza Grupelor', venue: 'MetLife Stadium, New York' },
  { homeTeam: 'Japonia', awayTeam: 'Belgia', homeTeamCode: 'JP', awayTeamCode: 'BE', matchDate: '2026-06-15T01:00:00', group: 'Grupa E', round: 'Faza Grupelor', venue: 'SoFi Stadium, Los Angeles' },
  { homeTeam: 'Germania', awayTeam: 'Japonia', homeTeamCode: 'DE', awayTeamCode: 'JP', matchDate: '2026-06-19T22:00:00', group: 'Grupa E', round: 'Faza Grupelor', venue: 'Gillette Stadium, Boston' },
  { homeTeam: 'Belgia', awayTeam: 'Arabia Saudita', homeTeamCode: 'BE', awayTeamCode: 'SA', matchDate: '2026-06-20T01:00:00', group: 'Grupa E', round: 'Faza Grupelor', venue: 'Lincoln Financial Field, Philadelphia' },
  { homeTeam: 'Germania', awayTeam: 'Belgia', homeTeamCode: 'DE', awayTeamCode: 'BE', matchDate: '2026-06-24T01:00:00', group: 'Grupa E', round: 'Faza Grupelor', venue: 'Rose Bowl, Los Angeles' },
  { homeTeam: 'Arabia Saudita', awayTeam: 'Japonia', homeTeamCode: 'SA', awayTeamCode: 'JP', matchDate: '2026-06-24T01:00:00', group: 'Grupa E', round: 'Faza Grupelor', venue: 'NRG Stadium, Houston' },

  // GRUPA F
  { homeTeam: 'Portugalia', awayTeam: 'Irak', homeTeamCode: 'PT', awayTeamCode: 'IQ', matchDate: '2026-06-13T22:00:00', group: 'Grupa F', round: 'Faza Grupelor', venue: 'SoFi Stadium, Los Angeles' },
  { homeTeam: 'Croatia', awayTeam: 'Elvetia', homeTeamCode: 'HR', awayTeamCode: 'CH', matchDate: '2026-06-14T01:00:00', group: 'Grupa F', round: 'Faza Grupelor', venue: 'AT&T Stadium, Dallas' },
  { homeTeam: 'Portugalia', awayTeam: 'Croatia', homeTeamCode: 'PT', awayTeamCode: 'HR', matchDate: '2026-06-18T22:00:00', group: 'Grupa F', round: 'Faza Grupelor', venue: 'Arrowhead Stadium, Kansas City' },
  { homeTeam: 'Elvetia', awayTeam: 'Irak', homeTeamCode: 'CH', awayTeamCode: 'IQ', matchDate: '2026-06-19T01:00:00', group: 'Grupa F', round: 'Faza Grupelor', venue: 'BC Place, Vancouver' },
  { homeTeam: 'Portugalia', awayTeam: 'Elvetia', homeTeamCode: 'PT', awayTeamCode: 'CH', matchDate: '2026-06-23T22:00:00', group: 'Grupa F', round: 'Faza Grupelor', venue: 'Lincoln Financial Field, Philadelphia' },
  { homeTeam: 'Irak', awayTeam: 'Croatia', homeTeamCode: 'IQ', awayTeamCode: 'HR', matchDate: '2026-06-23T22:00:00', group: 'Grupa F', round: 'Faza Grupelor', venue: 'NRG Stadium, Houston' },

  // GRUPA G
  { homeTeam: 'Brazilia', awayTeam: 'Ecuador', homeTeamCode: 'BR', awayTeamCode: 'EC', matchDate: '2026-06-15T22:00:00', group: 'Grupa G', round: 'Faza Grupelor', venue: 'NRG Stadium, Houston' },
  { homeTeam: 'Australia', awayTeam: 'Camerun', homeTeamCode: 'AU', awayTeamCode: 'CM', matchDate: '2026-06-16T01:00:00', group: 'Grupa G', round: 'Faza Grupelor', venue: 'Arrowhead Stadium, Kansas City' },
  { homeTeam: 'Brazilia', awayTeam: 'Australia', homeTeamCode: 'BR', awayTeamCode: 'AU', matchDate: '2026-06-20T22:00:00', group: 'Grupa G', round: 'Faza Grupelor', venue: 'AT&T Stadium, Dallas' },
  { homeTeam: 'Camerun', awayTeam: 'Ecuador', homeTeamCode: 'CM', awayTeamCode: 'EC', matchDate: '2026-06-21T01:00:00', group: 'Grupa G', round: 'Faza Grupelor', venue: 'SoFi Stadium, Los Angeles' },
  { homeTeam: 'Brazilia', awayTeam: 'Camerun', homeTeamCode: 'BR', awayTeamCode: 'CM', matchDate: '2026-06-25T01:00:00', group: 'Grupa G', round: 'Faza Grupelor', venue: 'Rose Bowl, Los Angeles' },
  { homeTeam: 'Ecuador', awayTeam: 'Australia', homeTeamCode: 'EC', awayTeamCode: 'AU', matchDate: '2026-06-25T01:00:00', group: 'Grupa G', round: 'Faza Grupelor', venue: 'Gillette Stadium, Boston' },

  // GRUPA H
  { homeTeam: 'Olanda', awayTeam: 'Senegal', homeTeamCode: 'NL', awayTeamCode: 'SN', matchDate: '2026-06-15T19:00:00', group: 'Grupa H', round: 'Faza Grupelor', venue: 'Lincoln Financial Field, Philadelphia' },
  { homeTeam: 'Uruguay', awayTeam: 'Angola', homeTeamCode: 'UY', awayTeamCode: 'AO', matchDate: '2026-06-16T04:00:00', group: 'Grupa H', round: 'Faza Grupelor', venue: 'Estadio Azteca, Mexico City' },
  { homeTeam: 'Olanda', awayTeam: 'Uruguay', homeTeamCode: 'NL', awayTeamCode: 'UY', matchDate: '2026-06-20T19:00:00', group: 'Grupa H', round: 'Faza Grupelor', venue: 'MetLife Stadium, New York' },
  { homeTeam: 'Angola', awayTeam: 'Senegal', homeTeamCode: 'AO', awayTeamCode: 'SN', matchDate: '2026-06-21T04:00:00', group: 'Grupa H', round: 'Faza Grupelor', venue: 'Levi\'s Stadium, San Francisco' },
  { homeTeam: 'Olanda', awayTeam: 'Angola', homeTeamCode: 'NL', awayTeamCode: 'AO', matchDate: '2026-06-25T22:00:00', group: 'Grupa H', round: 'Faza Grupelor', venue: 'AT&T Stadium, Dallas' },
  { homeTeam: 'Senegal', awayTeam: 'Uruguay', homeTeamCode: 'SN', awayTeamCode: 'UY', matchDate: '2026-06-25T22:00:00', group: 'Grupa H', round: 'Faza Grupelor', venue: 'Arrowhead Stadium, Kansas City' },

  // GRUPA I
  { homeTeam: 'Anglia', awayTeam: 'Tunisia', homeTeamCode: 'GB-ENG', awayTeamCode: 'TN', matchDate: '2026-06-12T19:00:00', group: 'Grupa I', round: 'Faza Grupelor', venue: 'Gillette Stadium, Boston' },
  { homeTeam: 'Congo RD', awayTeam: 'Mexic', homeTeamCode: 'CD', awayTeamCode: 'MX', matchDate: '2026-06-13T04:00:00', group: 'Grupa I', round: 'Faza Grupelor', venue: 'Estadio Azteca, Mexico City' },
  { homeTeam: 'Anglia', awayTeam: 'Congo RD', homeTeamCode: 'GB-ENG', awayTeamCode: 'CD', matchDate: '2026-06-17T19:00:00', group: 'Grupa I', round: 'Faza Grupelor', venue: 'Rose Bowl, Los Angeles' },
  { homeTeam: 'Mexic', awayTeam: 'Tunisia', homeTeamCode: 'MX', awayTeamCode: 'TN', matchDate: '2026-06-18T04:00:00', group: 'Grupa I', round: 'Faza Grupelor', venue: 'NRG Stadium, Houston' },
  { homeTeam: 'Anglia', awayTeam: 'Mexic', homeTeamCode: 'GB-ENG', awayTeamCode: 'MX', matchDate: '2026-06-22T19:00:00', group: 'Grupa I', round: 'Faza Grupelor', venue: 'AT&T Stadium, Dallas' },
  { homeTeam: 'Tunisia', awayTeam: 'Congo RD', homeTeamCode: 'TN', awayTeamCode: 'CD', matchDate: '2026-06-22T19:00:00', group: 'Grupa I', round: 'Faza Grupelor', venue: 'SoFi Stadium, Los Angeles' },

  // GRUPA J
  { homeTeam: 'Africa de Sud', awayTeam: 'Islanda', homeTeamCode: 'ZA', awayTeamCode: 'IS', matchDate: '2026-06-12T04:00:00', group: 'Grupa J', round: 'Faza Grupelor', venue: 'Estadio Azteca, Mexico City' },
  { homeTeam: 'Iran', awayTeam: 'Rep. Ceha', homeTeamCode: 'IR', awayTeamCode: 'CZ', matchDate: '2026-06-12T22:00:00', group: 'Grupa J', round: 'Faza Grupelor', venue: 'Arrowhead Stadium, Kansas City' },
  { homeTeam: 'Iran', awayTeam: 'Africa de Sud', homeTeamCode: 'IR', awayTeamCode: 'ZA', matchDate: '2026-06-16T22:00:00', group: 'Grupa J', round: 'Faza Grupelor', venue: 'Gillette Stadium, Boston' },
  { homeTeam: 'Rep. Ceha', awayTeam: 'Islanda', homeTeamCode: 'CZ', awayTeamCode: 'IS', matchDate: '2026-06-17T01:00:00', group: 'Grupa J', round: 'Faza Grupelor', venue: 'Levi\'s Stadium, San Francisco' },
  { homeTeam: 'Iran', awayTeam: 'Rep. Ceha', homeTeamCode: 'IR', awayTeamCode: 'CZ', matchDate: '2026-06-21T22:00:00', group: 'Grupa J', round: 'Faza Grupelor', venue: 'Lincoln Financial Field, Philadelphia' },
  { homeTeam: 'Islanda', awayTeam: 'Africa de Sud', homeTeamCode: 'IS', awayTeamCode: 'ZA', matchDate: '2026-06-21T22:00:00', group: 'Grupa J', round: 'Faza Grupelor', venue: 'BC Place, Vancouver' },

  // GRUPA K
  { homeTeam: 'Italia', awayTeam: 'Ecuador', homeTeamCode: 'IT', awayTeamCode: 'EC', matchDate: '2026-06-11T19:00:00', group: 'Grupa K', round: 'Faza Grupelor', venue: 'Lincoln Financial Field, Philadelphia' },
  { homeTeam: 'Norvegia', awayTeam: 'Coasta de Fildes', homeTeamCode: 'NO', awayTeamCode: 'CI', matchDate: '2026-06-12T01:00:00', group: 'Grupa K', round: 'Faza Grupelor', venue: 'BC Place, Vancouver' },
  { homeTeam: 'Italia', awayTeam: 'Norvegia', homeTeamCode: 'IT', awayTeamCode: 'NO', matchDate: '2026-06-16T19:00:00', group: 'Grupa K', round: 'Faza Grupelor', venue: 'NRG Stadium, Houston' },
  { homeTeam: 'Coasta de Fildes', awayTeam: 'Ecuador', homeTeamCode: 'CI', awayTeamCode: 'EC', matchDate: '2026-06-17T04:00:00', group: 'Grupa K', round: 'Faza Grupelor', venue: 'Estadio Azteca, Mexico City' },
  { homeTeam: 'Italia', awayTeam: 'Coasta de Fildes', homeTeamCode: 'IT', awayTeamCode: 'CI', matchDate: '2026-06-21T19:00:00', group: 'Grupa K', round: 'Faza Grupelor', venue: 'SoFi Stadium, Los Angeles' },
  { homeTeam: 'Ecuador', awayTeam: 'Norvegia', homeTeamCode: 'EC', awayTeamCode: 'NO', matchDate: '2026-06-21T19:00:00', group: 'Grupa K', round: 'Faza Grupelor', venue: 'Gillette Stadium, Boston' },

  // GRUPA L
  { homeTeam: 'Coreea de Sud', awayTeam: 'Ghana', homeTeamCode: 'KR', awayTeamCode: 'GH', matchDate: '2026-06-11T04:00:00', group: 'Grupa L', round: 'Faza Grupelor', venue: 'Estadio Azteca, Mexico City' },
  { homeTeam: 'Maroc', awayTeam: 'Zambia', homeTeamCode: 'MA', awayTeamCode: 'ZM', matchDate: '2026-06-11T22:00:00', group: 'Grupa L', round: 'Faza Grupelor', venue: 'Levi\'s Stadium, San Francisco' },
  { homeTeam: 'Coreea de Sud', awayTeam: 'Maroc', homeTeamCode: 'KR', awayTeamCode: 'MA', matchDate: '2026-06-15T22:00:00', group: 'Grupa L', round: 'Faza Grupelor', venue: 'Arrowhead Stadium, Kansas City' },
  { homeTeam: 'Zambia', awayTeam: 'Ghana', homeTeamCode: 'ZM', awayTeamCode: 'GH', matchDate: '2026-06-16T01:00:00', group: 'Grupa L', round: 'Faza Grupelor', venue: 'AT&T Stadium, Dallas' },
  { homeTeam: 'Coreea de Sud', awayTeam: 'Zambia', homeTeamCode: 'KR', awayTeamCode: 'ZM', matchDate: '2026-06-20T04:00:00', group: 'Grupa L', round: 'Faza Grupelor', venue: 'Estadio Azteca, Mexico City' },
  { homeTeam: 'Ghana', awayTeam: 'Maroc', homeTeamCode: 'GH', awayTeamCode: 'MA', matchDate: '2026-06-20T04:00:00', group: 'Grupa L', round: 'Faza Grupelor', venue: 'BC Place, Vancouver' },
];

async function seed() {
  console.log('Seeding database...');

  // Admin user
  const adminPass = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: adminPass, isAdmin: true },
  });
  console.log('Admin creat: username=admin, password=admin123');

  // Meciuri
  const existingCount = await prisma.match.count();
  if (existingCount === 0) {
    await prisma.match.createMany({
      data: matches.map(m => ({
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeTeamCode: m.homeTeamCode,
        awayTeamCode: m.awayTeamCode,
        matchDate: new Date(m.matchDate),
        group: m.group,
        round: m.round,
        venue: m.venue,
      })),
    });
    console.log(`${matches.length} meciuri create`);
  } else {
    console.log(`Meciurile există deja (${existingCount} înregistrări)`);
  }

  console.log('Seed complet!');
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
