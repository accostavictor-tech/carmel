# Marcenaria Carmel — Sistema de Gestão

Sistema de gestão para a marcenaria, focado na dor mais urgente hoje: **acompanhamento dos projetos fechados** — margem/lucro real por projeto, faturamento do mês x meta e prazos de produção.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + PostgreSQL
- NextAuth (Credentials) para login

## Deploy no Vercel (recomendado)

1. **Criar o banco Postgres.** No painel do Vercel, dentro do projeto: aba **Storage → Create Database → Postgres** (é o Neon, tem plano gratuito). Isso cria automaticamente as variáveis `POSTGRES_PRISMA_URL` e `POSTGRES_URL_NON_POOLING`.

2. **Importar o repositório.** Em [vercel.com/new](https://vercel.com/new), importe este repositório GitHub e selecione a branch desejada.

3. **Configurar as variáveis de ambiente** do projeto no Vercel (Settings → Environment Variables):
   - `DATABASE_URL` = valor de `POSTGRES_PRISMA_URL` (conexão via pooler)
   - `DIRECT_URL` = valor de `POSTGRES_URL_NON_POOLING` (conexão direta, usada pelas migrations)
   - `AUTH_SECRET` = gere com `openssl rand -base64 32`

4. **Deploy.** O build já roda `prisma migrate deploy` automaticamente (configurado em `package.json`), então o banco é criado/atualizado a cada deploy.

5. **Criar o usuário inicial.** As migrations não populam usuários — rode o seed uma vez apontando para o banco de produção:

   ```bash
   DATABASE_URL="<POSTGRES_PRISMA_URL de produção>" DIRECT_URL="<POSTGRES_URL_NON_POOLING de produção>" npx prisma db seed
   ```

   Isso cria o login `contato@marcenariacarmel.com.br` e a meta do mês atual.

Alternativa: usar um Postgres de outro provedor (ex: [Neon](https://neon.tech) direto, [Supabase](https://supabase.com)) — o processo é o mesmo, só troca de onde vêm `DATABASE_URL`/`DIRECT_URL`.

## Rodando localmente

1. Tenha um Postgres acessível (local via Docker, ou um banco na nuvem como Neon).

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Copie `.env.example` para `.env` e preencha `DATABASE_URL`, `DIRECT_URL` (podem ser a mesma string se não estiver usando pooler) e `AUTH_SECRET` (gere com `openssl rand -base64 32`).

4. Rode as migrations e o seed inicial:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Suba o servidor:

   ```bash
   npm run dev
   ```

6. Acesse `http://localhost:3000/login`. Login criado pelo seed: `contato@marcenariacarmel.com.br`.

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
