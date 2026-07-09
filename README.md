# ForgeFit — personal-gym

Diário de treinos com persistência real (SQLite), autocomplete de exercícios
e cronômetro de descanso.

## Stack

- **Frontend**: HTML/CSS/JS puro (`public/`), servido pelo próprio backend
- **Backend**: Node.js + TypeScript + Express (`server/`)
- **Banco**: SQLite via Prisma, arquivo persistido em `server/data/` (ou volume Docker)
- **Exercícios**: autocomplete via API pública do [wger.de](https://wger.de)

## Rodando com Docker (recomendado)

```bash
docker compose up -d --build
```

O app fica disponível em `http://localhost:8081` (ajuste a porta em
`docker-compose.yml` se já estiver em uso). Os dados ficam persistidos em
`./data/forgefit.db` no host, sobrevivendo a rebuilds e restarts do container.

Para atualizar após um `git pull`:

```bash
docker compose up -d --build
```

## Rodando localmente sem Docker (desenvolvimento)

```bash
cd server
npm install
npx prisma migrate dev
npm run dev
```

O servidor sobe em `http://localhost:3000` (API + frontend).
