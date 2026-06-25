require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.match.findMany({ take: 5, select: { homeTeam: true, homeTeamCode: true, awayTeam: true, awayTeamCode: true } })
  .then(r => { console.log(JSON.stringify(r, null, 2)); p.$disconnect(); });
