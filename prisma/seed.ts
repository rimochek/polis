// Account registration creates private fixtures, so seeding must not add shared case data.
import { prisma } from '../server/db.js';

console.log(
  'No global seed data is created. Register an account to create its private synthetic demo company.',
);
await prisma.$disconnect();
