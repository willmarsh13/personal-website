# Multi-stage build: compile the React app and install server deps in throwaway
# stages, then ship only what runs. Keeps the final image small so repeated
# deploys don't fill the host's disk.

# ---- 1. Build the client (dev tooling stays in this stage) ----
FROM node:22-slim AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --no-audit --no-fund
COPY client/ ./
RUN npm run build

# ---- 2. Server production dependencies only ----
FROM node:22-slim AS server-deps
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# ---- 3. Runtime ----
FROM node:22-slim

ARG NODE_ENV=production
ARG DD_GIT_REPOSITORY_URL
ARG DD_GIT_COMMIT_SHA

ENV NODE_ENV=$NODE_ENV
ENV DD_GIT_REPOSITORY_URL=${DD_GIT_REPOSITORY_URL}
ENV DD_GIT_COMMIT_SHA=${DD_GIT_COMMIT_SHA}

WORKDIR /usr/src/personalsite

COPY --from=server-deps /app/server/node_modules ./server/node_modules
COPY server/ ./server/
COPY --from=client-build /app/client/build ./client/build

# Don't run as root.
USER node

EXPOSE 3001
# Run node directly (not via npm) so it receives stop signals and shuts down promptly.
CMD ["node", "server/index.js"]
