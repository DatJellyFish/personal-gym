# ForgeFit — personal-gym

Diário de treinos com persistência real (SQLite), modelos de treino
reutilizáveis, autocomplete de exercícios e cronômetro de descanso.

## Páginas

- **Dashboard**: estatísticas gerais e treinos recentes
- **Registrar Treino**: loga uma sessão, podendo partir de um modelo salvo
- **Treinos Salvos**: histórico completo, busca e gráfico de evolução de carga
- **Montar Treino**: cria/edita modelos reutilizáveis de treino

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + React Router (`web/`)
- **Backend**: Node.js + TypeScript + Express (`server/`), serve a API e o build do frontend
- **Banco**: SQLite via Prisma, arquivo persistido em `server/data/` (ou volume Docker)
- **Exercícios**: autocomplete via API pública do [wger.de](https://wger.de)

## Rodando com Docker (recomendado)

```bash
docker compose up -d --build
```

O app fica disponível em `http://localhost:8088` (ajuste a porta em
`docker-compose.yml` se já estiver em uso). Os dados ficam persistidos em
`./data/forgefit.db` no host, sobrevivendo a rebuilds e restarts do container.

Para atualizar após um `git pull`:

```bash
docker compose up -d --build
```

## Rodando localmente sem Docker (desenvolvimento)

Backend:

```bash
cd server
npm install
npx prisma migrate dev
npm run dev
```

Frontend (em outro terminal — o Vite faz proxy de `/api` para `localhost:3000`):

```bash
cd web
npm install
npm run dev
```

O frontend de desenvolvimento sobe em `http://localhost:5173`.
