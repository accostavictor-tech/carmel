-- AlterTable
ALTER TABLE "Orcamento" ADD COLUMN     "clienteEmail" TEXT,
ADD COLUMN     "clienteEmpresa" TEXT,
ADD COLUMN     "clienteTelefone" TEXT;

-- AlterTable
ALTER TABLE "Ambiente" ADD COLUMN     "descricao" TEXT;
