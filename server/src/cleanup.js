require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function cleanup() {
  await p.prediction.deleteMany({});
  console.log('Pronosticuri sterse');
  const r = await p.match.deleteMany({ where: { apiMatchId: null } });
  console.log('Meciuri gresite sterse:', r.count);
  await p.$disconnect();
}

cleanup().catch(e => { console.error(e); p.$disconnect(); });
