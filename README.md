
# Senhor Natureza

Sistema de agendamento para serviços de jardinagem e paisagismo.

## Funcionalidades

### Área Pública (Cliente)
- Seleção de serviços disponíveis
- Verificação de datas disponíveis (Amanhã, Segunda, Terça, Quarta, Quinta, outras datas)
- Seleção de horários disponíveis
- Formulário de agendamento com dados do cliente

### Área Administrativa
- **Serviços**: Gerenciar serviços oferecidos (nome, descrição, duração, preço)
- **Horários de Funcionamento**: Configurar horários de atendimento por dia da semana
- **Dias de Folga**: Marcar dias em que a empresa não funcionará
- **Agendamentos**: Visualizar e gerenciar todos os agendamentos (status, filtros)

## Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Prisma ORM** com PostgreSQL (produção) / SQLite (desenvolvimento)
- **Tailwind CSS**
- **date-fns** para manipulação de datas

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure o banco de dados:

**Para desenvolvimento local (SQLite):**
```bash
npm run db:generate
npm run db:push
```

**Para produção (PostgreSQL):**
Configure a variável de ambiente `DATABASE_URL` com a string de conexão do PostgreSQL.

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto:
```env
# Banco de dados (desenvolvimento usa SQLite, produção usa PostgreSQL)
DATABASE_URL="file:./prisma/dev.db"  # Para desenvolvimento local
# DATABASE_URL="postgresql://user:password@host:port/database"  # Para produção

# Para Supabase com connection pooling (pgbouncer), use:
# DATABASE_URL="postgresql://...pooler.supabase.com:6543/...?pgbouncer=true"
# DIRECT_URL="postgresql://...pooler.supabase.com:5432/..."  # Conexão direta para migrações

# Credenciais do administrador
# Suporta tanto ADMIN_USERNAME quanto USERNAME
ADMIN_USERNAME=admin
# ou
USERNAME=admin
ADMIN_PASSWORD=sua-senha-segura
JWT_SECRET=sua-chave-secreta-jwt
```

**Nota:** Se não criar o arquivo `.env.local`, as credenciais padrão serão:
- Usuário: `admin`
- Senha: `admin123`

**Importante para Supabase:**
- `DATABASE_URL`: Use a URL do pooler (porta 6543) para queries normais
- `DIRECT_URL`: Use a conexão direta (porta 5432) para migrações. Se não estiver usando pooling, defina igual ao `DATABASE_URL`

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse:
- Site público: http://localhost:3000
- Área administrativa: http://localhost:3000/admin (requer login)

## Estrutura do Projeto

```
rubens-garden/
├── app/
│   ├── api/              # Rotas da API
│   │   ├── services/     # Serviços públicos
│   │   ├── availability/ # Verificação de disponibilidade
│   │   ├── bookings/     # Criação de agendamentos
│   │   └── admin/        # Rotas administrativas
│   ├── admin/            # Página administrativa
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Página inicial
├── components/           # Componentes React
│   ├── ServiceSelection.tsx
│   ├── DateSelection.tsx
│   ├── TimeSelection.tsx
│   ├── BookingForm.tsx
│   └── admin/            # Componentes administrativos
├── lib/                  # Utilitários
│   ├── prisma.ts         # Cliente Prisma
│   └── utils.ts          # Funções auxiliares
└── prisma/
    └── schema.prisma     # Schema do banco de dados
```

## Autenticação

A área administrativa está protegida por autenticação. Para acessar:

1. Acesse http://localhost:3000/admin
2. Você será redirecionado para a página de login
3. Use as credenciais configuradas (padrão: `admin` / `admin123`)
4. Após o login, você terá acesso completo à área administrativa

**Importante:** Em produção, altere as credenciais padrão através das variáveis de ambiente.

## Configuração Inicial

Após fazer login na área administrativa, configure:

1. **Serviços**: Adicione os serviços oferecidos (ex: Manutenção, Orçamento, Paisagismo)
2. **Horários**: Configure os horários de funcionamento para cada dia da semana
3. **Dias de Folga**: Marque os dias em que não haverá atendimento

## Fluxo de Agendamento

1. Cliente acessa o site e seleciona um serviço
2. Sistema verifica disponibilidade e mostra datas disponíveis
3. Cliente seleciona uma data
4. Sistema mostra horários disponíveis para aquela data
5. Cliente preenche formulário com seus dados
6. Agendamento é criado com status "pending"
7. Autônomo pode confirmar ou cancelar na área administrativa

## Status de Agendamento

- **pending**: Aguardando confirmação
- **confirmed**: Confirmado pelo autônomo
- **cancelled**: Cancelado
- **completed**: Serviço concluído

## Deploy na Vercel

### Pré-requisitos

1. **Banco de dados PostgreSQL**: A Vercel não suporta SQLite. Você precisa de um banco PostgreSQL:
   - Use o **Vercel Postgres** (recomendado): Adicione via dashboard da Vercel
   - Ou use outro serviço (Supabase, Neon, Railway, etc.)

### Passos para Deploy

1. **Conecte seu repositório à Vercel**

2. **Configure as variáveis de ambiente na Vercel:**
   - `DATABASE_URL`: String de conexão do PostgreSQL
   - `ADMIN_USERNAME`: Seu usuário administrativo
   - `ADMIN_PASSWORD`: Sua senha administrativa
   - `JWT_SECRET`: Chave secreta para JWT (gere uma chave segura)

3. **Execute as migrações do banco:**
   Após o primeiro deploy, execute no terminal da Vercel ou localmente:
   ```bash
   npx prisma db push
   ```
   Ou use o Prisma Migrate:
   ```bash
   npx prisma migrate deploy
   ```

4. **Faça o deploy:**
   A Vercel fará o build automaticamente. O script `postinstall` gerará o Prisma Client automaticamente.

### Troubleshooting

**Erro 404 na Vercel:**
- Verifique se `DATABASE_URL` está configurada corretamente
- Certifique-se de que o banco PostgreSQL está acessível
- Execute `prisma db push` para criar as tabelas
- Verifique os logs de build na Vercel

**Erro 500 nas APIs (Erro ao buscar serviços/solicitações/agendamentos):**
Este é o problema mais comum após o deploy. Significa que o banco de dados não está configurado ou as tabelas não foram criadas.

**Solução passo a passo:**

1. **Configure o banco PostgreSQL na Vercel:**
   - Acesse o dashboard da Vercel
   - Vá em seu projeto → "Storage" → "Create Database"
   - Selecione "Postgres" e crie o banco
   - A variável `DATABASE_URL` será criada automaticamente

2. **Ou use um serviço externo (Supabase, Neon, etc.):**
   - Crie uma conta no serviço escolhido
   - Crie um novo projeto/banco
   - Copie a string de conexão (DATABASE_URL)
   - Adicione como variável de ambiente na Vercel

3. **Crie as tabelas no banco:**
   O script de build tenta criar as tabelas automaticamente, mas se isso falhar, você precisa criá-las manualmente:

   **Opção A - Automático (tentado durante o build):**
   O script `vercel-build.js` tenta criar as tabelas automaticamente durante cada deploy.
   Se isso falhar, use uma das opções abaixo.

   **Opção B - Via Vercel CLI (recomendado se automático falhar):**
   ```bash
   # Instale a Vercel CLI se ainda não tiver
   npm i -g vercel
   
   # Conecte ao seu projeto
   vercel link
   
   # Execute o script de setup
   npm run db:setup
   # Ou diretamente:
   npx prisma db push
   ```

   **Opção C - Via terminal local:**
   ```bash
   # Configure a DATABASE_URL localmente (temporariamente)
   export DATABASE_URL="sua-string-de-conexao-da-vercel"
   
   # Execute o script de setup
   npm run db:setup
   # Ou diretamente:
   npx prisma db push
   ```

   **Opção D - Via Prisma Studio (se tiver acesso ao banco):**
   ```bash
   npx prisma studio
   # Crie as tabelas manualmente ou use a interface
   ```

4. **Verifique se funcionou:**
   - Acesse sua aplicação na Vercel
   - As APIs devem retornar arrays vazios `[]` em vez de erros 500
   - Faça login na área administrativa e adicione alguns dados de teste

**Erro de conexão com banco:**
- Verifique se a string `DATABASE_URL` está correta na Vercel
- Confirme que o banco aceita conexões externas (se não for Vercel Postgres)
- Verifique se as credenciais estão corretas
- Verifique os logs da Vercel para mensagens de erro específicas do Prisma
