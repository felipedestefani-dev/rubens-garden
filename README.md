
# Rubens Garden

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

# Credenciais do administrador
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua-senha-segura
JWT_SECRET=sua-chave-secreta-jwt
```

**Nota:** Se não criar o arquivo `.env.local`, as credenciais padrão serão:
- Usuário: `admin`
- Senha: `admin123`

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

**Erro de conexão com banco:**
- Verifique se a string `DATABASE_URL` está correta
- Confirme que o banco aceita conexões externas (se não for Vercel Postgres)
- Verifique se as credenciais estão corretas
