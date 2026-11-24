# syntax=docker/dockerfile:1

# ---- build: install everything, bundle the frontend, compile the backend ----
FROM node:26-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --omit=dev


# ---- runtime ----
FROM node:26-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000

COPY --from=build /app/node_modules node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/backend/package.json backend/
COPY --from=build /app/backend/dist backend/dist
COPY --from=build /app/frontend/dist frontend/dist

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "backend/dist/server.js"]
