FROM node:18

ARG NODE_ENV=local
ARG DD_GIT_REPOSITORY_URL
ARG DD_GIT_COMMIT_SHA

ENV NODE_ENV=$NODE_ENV
ENV DD_GIT_REPOSITORY_URL=${DD_GIT_REPOSITORY_URL}
ENV DD_GIT_COMMIT_SHA=${DD_GIT_COMMIT_SHA}

WORKDIR /usr/src/personalsite

COPY server/package*.json ./server/
RUN npm --prefix ./server install

COPY client/package*.json ./client/
RUN npm --prefix ./client install

COPY . .

RUN npm --prefix ./server run build

EXPOSE 3006
CMD NODE_ENV=$NODE_ENV npm --prefix run startProd