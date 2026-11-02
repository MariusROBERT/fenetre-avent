FROM node:24-bookworm-slim AS build
WORKDIR /app
ARG ORIGIN=http://localhost:3024
ENV ORIGIN=${ORIGIN}
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/config ./config
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/src/lib/server/db/schema.js ./src/lib/server/db/schema.js
COPY scripts/migrate.js ./scripts/migrate.js
RUN mkdir -p /data && chown node:node /data
USER node
ENV HOST=0.0.0.0 PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
