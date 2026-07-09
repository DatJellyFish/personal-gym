# ForgeFit — personal-gym

Diário de treinos inspirado no Hevy: rotinas reutilizáveis, treino ao vivo
com log de séries individuais (reps/peso/check por série), cronômetro de
descanso automático e persistência real (SQLite).

## Páginas

- **Início**: inicia um treino (em branco ou a partir de uma rotina), estatísticas rápidas e treinos recentes
- **Rotinas**: cria/edita modelos reutilizáveis, com séries-alvo (reps + peso) por exercício
- **Sessão ativa** (`/sessao/:id`): tela de treino ao vivo — cada série tem reps, peso e um check de concluída; ao marcar uma série o cronômetro de descanso dispara sozinho
- **Histórico**: treinos concluídos, busca, e gráfico de evolução de carga por exercício
- **Perfil**: estatísticas agregadas (sequência, volume total, séries) e recordes pessoais por exercício

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
