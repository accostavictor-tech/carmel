import { PrismaClient, CategoriaInsumo } from "@prisma/client";

const prisma = new PrismaClient();

type Linha = { nome: string; unidade: string; valorUnitario: number };

const CORREDICAS: Linha[] = [
  { nome: "Corrediça Branca 25cm 20kg (AT)", unidade: "par", valorUnitario: 12.54 },
  { nome: "Corrediça Branca 30cm 20kg (AT)", unidade: "par", valorUnitario: 13.97 },
  { nome: "Corrediça Branca 35cm 20kg (AT)", unidade: "par", valorUnitario: 14.17 },
  { nome: "Corrediça Branca 40cm 20kg (AT)", unidade: "par", valorUnitario: 13.77 },
  { nome: "Corrediça Branca 45cm 20kg (AT)", unidade: "par", valorUnitario: 15.31 },
  { nome: "Corrediça Invisível FGV Amort. EP 400mm 25kg", unidade: "par", valorUnitario: 76.05 },
  { nome: "Corrediça Invisível FGV Amort. EP 450mm 25kg (AT)", unidade: "par", valorUnitario: 67.05 },
  { nome: "Corrediça Invisível FGV Amort. EP 500mm 25kg (AT)", unidade: "par", valorUnitario: 121.07 },
  { nome: "Corrediça Invisível FGV Amort. ET 300mm 25kg", unidade: "par", valorUnitario: 98.51 },
  { nome: "Corrediça Invisível FGV Amort. ET 350mm 25kg", unidade: "par", valorUnitario: 101.59 },
  { nome: "Corrediça Invisível FGV One Touch EP 300mm", unidade: "par", valorUnitario: 59.5 },
  { nome: "Corrediça Invisível FGV One Touch EP 350mm", unidade: "par", valorUnitario: 85.0 },
  { nome: "Corrediça Invisível FGV One Touch EP 400mm (AT)", unidade: "par", valorUnitario: 87.73 },
  { nome: "Corrediça Invisível FGV One Touch EP 450mm (AT)", unidade: "unid", valorUnitario: 90.99 },
  { nome: "Corrediça Invisível FGV One Touch EP 500mm (AT)", unidade: "par", valorUnitario: 89.56 },
  { nome: "Corrediça Invisível FGV One Touch EP 550mm", unidade: "par", valorUnitario: 103.07 },
  { nome: "Corrediça Teclado FGV TTS40/204 EP", unidade: "par", valorUnitario: 203.15 },
  { nome: "Corrediça Teclado FGV TTS40/404 EP", unidade: "par", valorUnitario: 151.48 },
  { nome: "Corrediça Telescópica FGV/Hafele 350mm 35kg Larga", unidade: "unid", valorUnitario: 13.84 },
  { nome: "Corrediça Telescópica FGV/Hafele 400mm 35kg Larga", unidade: "unid", valorUnitario: 15.82 },
  { nome: "Corrediça Telescópica FGV/Hafele 450mm 35kg Larga", unidade: "unid", valorUnitario: 17.8 },
  { nome: "Corrediça Telescópica Mini FGV/Hafele 350mm 30kg", unidade: "unid", valorUnitario: 9.48 },
  { nome: "Corrediça Telescópica Mini FGV/Hafele 400mm 30kg", unidade: "unid", valorUnitario: 10.82 },
  { nome: "Corrediça Telescópica Mini FGV/Hafele 450mm 30kg", unidade: "unid", valorUnitario: 12.21 },
  { nome: "Corrediça Telescópica Mini Sim/Big 250mm 25kg (AT)", unidade: "par", valorUnitario: 6.82 },
  { nome: "Corrediça Telescópica Mini Sim/Big 300mm 25kg (AT)", unidade: "par", valorUnitario: 7.66 },
  { nome: "Corrediça Telescópica Mini Sim/Big 350mm 25kg (AT)", unidade: "par", valorUnitario: 8.93 },
  { nome: "Corrediça Telescópica Mini Sim/Big 400mm 25kg (AT)", unidade: "par", valorUnitario: 10.23 },
  { nome: "Corrediça Telescópica Mini Sim/Big 450mm 25kg (AT)", unidade: "par", valorUnitario: 11.48 },
  { nome: "Corrediça Telescópica Mini Sim/Big 500mm 25kg (AT)", unidade: "par", valorUnitario: 12.76 },
  { nome: "Corrediça Telescópica FGV 250mm 30kg (AT) Larga", unidade: "par", valorUnitario: 10.25 },
  { nome: "Corrediça Telescópica FGV 300mm 30kg (AT) Larga", unidade: "par", valorUnitario: 12.29 },
  { nome: "Corrediça Telescópica FGV 350mm 30kg (AT) Larga", unidade: "par", valorUnitario: 14.31 },
  { nome: "Corrediça Telescópica FGV 400mm 30kg (AT) Larga", unidade: "par", valorUnitario: 16.4 },
  { nome: "Corrediça Telescópica FGV 450mm 30kg (AT) Larga", unidade: "par", valorUnitario: 17.25 },
  { nome: "Corrediça Telescópica FGV 500mm 30kg (AT) Larga", unidade: "par", valorUnitario: 20.45 },
  { nome: "Corrediça Telescópica FGV 550mm 30kg (AT) Larga", unidade: "par", valorUnitario: 31.07 },
  { nome: "Corrediça Telescópica FGV Bra 250mm 45kg (AT)", unidade: "par", valorUnitario: 60.98 },
  { nome: "Corrediça Telescópica FGV Bra 300mm 45kg (AT)", unidade: "par", valorUnitario: 63.92 },
  { nome: "Corrediça Telescópica FGV Bra 350mm 45kg (AT)", unidade: "par", valorUnitario: 59.67 },
  { nome: "Corrediça Telescópica FGV Bra 400mm 45kg (AT)", unidade: "par", valorUnitario: 75.48 },
  { nome: "Corrediça Telescópica FGV Bra 450mm 45kg (AT)", unidade: "par", valorUnitario: 70.91 },
  { nome: "Corrediça Telescópica FGV Bra 500mm 45kg (AT)", unidade: "par", valorUnitario: 76.25 },
  { nome: "Corrediça Telescópica FGV Bra 550mm 45kg (AT)", unidade: "par", valorUnitario: 108.17 },
  { nome: "Corrediça Telescópica FGV Bra 600mm 45kg (AT)", unidade: "par", valorUnitario: 118.36 },
  { nome: "Corrediça Telescópica FGV Bra 650mm 45kg (AT)", unidade: "par", valorUnitario: 103.37 },
  { nome: "Corrediça Telescópica FGV Bra 700mm 45kg (AT)", unidade: "par", valorUnitario: 133.45 },
  { nome: "Corrediça Telescópica FGV One Touch 350mm 35kg (AT)", unidade: "par", valorUnitario: 60.72 },
  { nome: "Corrediça Telescópica FGV One Touch 400mm 35kg (AT)", unidade: "par", valorUnitario: 67.42 },
  { nome: "Corrediça Telescópica FGV One Touch 450mm 35kg (AT)", unidade: "par", valorUnitario: 67.36 },
  { nome: "Corrediça Telescópica FGV One Touch 500mm 35kg (AT)", unidade: "par", valorUnitario: 85.23 },
  { nome: "Corrediça Telescópica FGV One Touch 550mm 35kg (AT)", unidade: "par", valorUnitario: 91.34 },
  { nome: "Corrediça Telescópica FGV Slow 350mm 35kg (AT)", unidade: "par", valorUnitario: 67.73 },
  { nome: "Corrediça Telescópica FGV Slow 400mm 35kg (AT)", unidade: "par", valorUnitario: 74.17 },
  { nome: "Corrediça Telescópica FGV Slow 450mm 35kg (AT)", unidade: "par", valorUnitario: 75.77 },
  { nome: "Corrediça Telescópica FGV Slow 500mm 35kg (AT)", unidade: "par", valorUnitario: 85.23 },
  { nome: "Corrediça Telescópica FGV Slow 550mm 35kg (AT)", unidade: "par", valorUnitario: 102.01 },
  { nome: "Corrediça Telescópica Inox FGVTN 350mm 201 (AT)", unidade: "par", valorUnitario: 81.14 },
  { nome: "Corrediça Telescópica Inox FGVTN 400mm 201 (AT)", unidade: "par", valorUnitario: 92.71 },
  { nome: "Corrediça Telescópica Inox FGVTN 450mm 201 (AT)", unidade: "par", valorUnitario: 104.32 },
  { nome: "Corrediça Telescópica Inox FGVTN 500mm 201 (AT)", unidade: "par", valorUnitario: 115.9 },
  { nome: "Corrediça Telescópica Inox FGVTN Slow 450mm 201 (AT)", unidade: "par", valorUnitario: 136.99 },
  { nome: "Corrediça Telescópica Inox FGVTN Slow 500mm 201 (AT)", unidade: "par", valorUnitario: 178.13 },
  { nome: "Corrediça Telescópica Mini FGV 250mm 20kg (AT)", unidade: "par", valorUnitario: 8.37 },
  { nome: "Corrediça Telescópica Mini FGV 300mm 20kg (AT)", unidade: "par", valorUnitario: 10.01 },
  { nome: "Corrediça Telescópica Mini FGV 350mm 20kg (AT)", unidade: "par", valorUnitario: 10.13 },
  { nome: "Corrediça Telescópica Mini FGV 400mm 20kg (AT)", unidade: "par", valorUnitario: 10.82 },
  { nome: "Corrediça Telescópica Mini FGV 450mm 20kg (AT)", unidade: "par", valorUnitario: 13.04 },
  { nome: "Corrediça Telescópica Mini FGV 500mm 20kg (AT)", unidade: "par", valorUnitario: 18.35 },
  { nome: "Corrediça Telescópica Sim/Big 250mm 30/40kg (AT) Larga", unidade: "unid", valorUnitario: 8.91 },
  { nome: "Corrediça Telescópica Sim/Big 300mm 30/40kg (AT) Larga", unidade: "unid", valorUnitario: 10.71 },
  { nome: "Corrediça Telescópica Sim/Big 350mm 30/40kg (AT) Larga", unidade: "unid", valorUnitario: 12.52 },
  { nome: "Corrediça Telescópica Sim/Big 400mm 30/40kg (AT) Larga", unidade: "unid", valorUnitario: 14.3 },
  { nome: "Corrediça Telescópica Sim/Big 450mm 30/40kg (AT) Larga", unidade: "unid", valorUnitario: 16.08 },
  { nome: "Corrediça Telescópica Sim/Big 500mm 30/40kg (AT) Larga", unidade: "unid", valorUnitario: 17.86 },
];

async function main() {
  const existentes = await prisma.insumo.count({
    where: { categoria: CategoriaInsumo.FERRAGENS, nome: { startsWith: "Corrediça" } },
  });

  if (existentes > 0) {
    console.log(`Já existem ${existentes} corrediças cadastradas — importação pulada.`);
    return;
  }

  const resultado = await prisma.insumo.createMany({
    data: CORREDICAS.map((c) => ({
      nome: c.nome,
      categoria: CategoriaInsumo.FERRAGENS,
      unidade: c.unidade,
      valorUnitario: c.valorUnitario,
      percentualPerda: 0,
    })),
  });

  console.log(`Importadas ${resultado.count} corrediças de ferragens.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
