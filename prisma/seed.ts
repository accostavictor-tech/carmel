import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("120471", 10);

  await prisma.usuario.upsert({
    where: { email: "contato@marcenariacarmel.com.br" },
    update: { senhaHash },
    create: {
      nome: "Marcenaria Carmel",
      email: "contato@marcenariacarmel.com.br",
      senhaHash,
    },
  });

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

  console.log("Seed concluído. Login: contato@marcenariacarmel.com.br");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
