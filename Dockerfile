FROM node:22-alpine AS build-web
WORKDIR /app/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

FROM node:22-alpine AS build-server
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/ ./
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine
WORKDIR /app/server
ENV NODE_ENV=production
COPY --from=build-server /app/server/node_modules ./node_modules
COPY --from=build-server /app/server/dist ./dist
COPY --from=build-server /app/server/prisma ./prisma
COPY --from=build-server /app/server/package.json ./package.json
COPY --from=build-web /app/web/dist /app/web/dist

ENV DATABASE_URL="file:/app/data/forgefit.db"
ENV PUBLIC_DIR=/app/web/dist
ENV PORT=3000

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
