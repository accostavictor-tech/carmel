import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const senhaHashPadrao = await bcrypt.hash("carmel123", 10);

  const socios = [
    { nome: "Sócio 1", email: "socio1@marcenariacarmel.com.br" },
    { nome: "Sócio 2", email: "socio2@marcenariacarmel.com.br" },
  ];

  for (const socio of socios) {
    await prisma.usuario.upsert({
      where: { email: socio.email },
      update: {},
      create: { ...socio, senhaHash: senhaHashPadrao },
    });
  }

  const hoje = new Date();
  await prisma.metaMensal.upsert({
    where: { ano_mes: { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 } },
    update: {},
    create: {
      ano: hoje.getFullYear(),
      mes: hoje.getMonth() + 1,
      valorMeta: 50000,
    },
  });

  console.log("Seed concluído. Senha padrão dos sócios: carmel123 (troque depois do primeiro login).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
