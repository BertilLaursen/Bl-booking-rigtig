import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_SUPERADMIN_EMAIL || "admin@blabooking.dk";
  const password = process.env.SEED_SUPERADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.SEED_SUPERADMIN_NAME || "Superadmin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Superadmin findes allerede: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const superadmin = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: Role.SUPERADMIN,
      canManageUsers: true
    }
  });

  // Opret en første invitationskode, så der er noget at teste med
  const invitation = await prisma.invitation.create({
    data: {
      code: "BLA-" + Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      grantsRole: Role.USER,
      createdById: superadmin.id
    }
  });

  console.log("Superadmin oprettet:");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log("Første invitationskode (til test af almindelig bruger):");
  console.log(`  ${invitation.code}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
