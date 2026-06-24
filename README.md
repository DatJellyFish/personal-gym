# Personal Gym

App pessoal de treinos — musculação, corrida e cardio em geral.

## Estrutura

```
personal-gym/
├── backend/   # API Node.js + SQLite (roda no servidor caseiro)
└── mobile/    # App React Native (Expo)
```

## Backend (servidor caseiro)

```bash
cd backend
npm install
npm start        # produção na porta 3333
npm run dev      # desenvolvimento com hot-reload
```

O banco SQLite é criado automaticamente em `backend/data/gym.db`.

Variáveis de ambiente (criar `backend/.env`):
```
PORT=3333
DATA_DIR=./data
```

### Expor na rede local
O servidor já escuta em `0.0.0.0`, então qualquer dispositivo na mesma rede Wi-Fi pode acessar pelo IP do servidor. Para descobrir o IP no Linux: `ip addr show` ou `hostname -I`.

## Mobile (Expo)

```bash
cd mobile
npm install
npm start
```

Leia o QR code com o app **Expo Go** no celular.

### Configurar o servidor
Na primeira abertura, vá em **Início → ⚙️ Configurações** e informe o IP do servidor:
```
http://192.168.1.100:3333
```

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/plans | Lista planos de treino |
| POST | /api/plans | Cria plano |
| GET | /api/plans/:id | Detalhes do plano |
| PUT | /api/plans/:id | Atualiza plano |
| DELETE | /api/plans/:id | Remove plano |
| GET | /api/sessions | Lista sessões |
| POST | /api/sessions | Cria sessão (musculação ou cardio) |
| GET | /api/sessions/:id | Detalhes da sessão |
| PUT | /api/sessions/:id/complete | Finaliza sessão |
| DELETE | /api/sessions/:id | Remove sessão |
| GET | /api/stats/overview | Estatísticas gerais |
| GET | /api/stats/prs | Records pessoais por exercício |
| GET | /api/stats/exercise/:name | Histórico de um exercício |
| GET | /api/stats/cardio | Histórico de cardio |
| GET | /api/health | Health check |