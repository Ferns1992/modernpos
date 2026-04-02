FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build
RUN npm run build:server

EXPOSE 4000

CMD ["node", "server.js"]