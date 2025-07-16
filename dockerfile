FROM node:latest

WORKDIR /app

COPY ./server/package*.json ./server/
COPY ./client/package*.json ./client/

RUN npm --prefix ./server install --unsafe-perm=true
RUN npm --prefix ./client install --unsafe-perm=true

COPY . .

# Build the server
RUN npm --prefix ./server run build

EXPOSE 3001

CMD ["npm", "--prefix", "./server", "run", "startProd"]