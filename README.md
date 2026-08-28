# Marcenaria Carmel — Sistema de Gestão

Sistema de gestão para a marcenaria, focado na dor mais urgente hoje: **acompanhamento dos projetos fechados** — margem/lucro real por projeto, faturamento do mês x meta e prazos de produção.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite (fácil de rodar localmente, migra para Postgres depois se necessário)
- NextAuth (Credentials) para login dos sócios

## Rodando localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` e preencha `DATABASE_URL` (caminho absoluto, veja o comentário no arquivo) e `AUTH_SECRET` (gere com `openssl rand -base64 32`).

3. Rode as migrations e o seed inicial (cria os 2 usuários sócios e a meta do mês atual):

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. Suba o servidor:

   ```bash
   npm run dev
   ```

5. Acesse `http://localhost:3000/login`. Login padrão criado pelo seed:
   - `socio1@marcenariacarmel.com.br` / `carmel123`
   - `socio2@marcenariacarmel.com.br` / `carmel123`

   **Troque essas senhas** assim que possível (ainda não há tela de troca de senha — pode ser feito diretamente no banco por enquanto).

## O que o MVP cobre

- **Projetos**: cadastro com cliente, valor de venda, data de fechamento e prazo de entrega.
- **Custos por projeto**: lançamento de material, mão de obra e outros custos.
- **Margem/lucro**: calculado automaticamente por projeto (valor de venda − custos).
- **Status de produção**: fila → produção → acabamento → entrega → concluído.
- **Painel**: faturamento do mês x meta, margem média, projetos atrasados/próximos do prazo, distribuição por etapa de produção.

## Próximos passos possíveis

- Comercial: funil de orçamentos antes do fechamento (hoje o sistema começa no projeto já fechado).
- Financeiro: contas a pagar/receber, fluxo de caixa consolidado (hoje só existe o lucro por projeto).
- Gente e gestão: cadastro de equipe de produção, permissões por perfil (produção só vê/atualiza status, não vê financeiro).
- Troca de senha pela própria interface.
