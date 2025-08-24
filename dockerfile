FROM node:18-slim AS build

WORKDIR /app

COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm --prefix ./server ci && \
    npm --prefix ./client ci

COPY . .

RUN npm --prefix ./client run build
RUN cp -r ./client/build ./server/build

FROM node:18-slim

WORKDIR /app

COPY --from=build /app/server ./server

EXPOSE 3001
CMD ["npm", "--prefix", "./server", "run", "startProd"]
