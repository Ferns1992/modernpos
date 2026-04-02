FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ git

COPY package*.json package-lock.json ./
RUN npm ci --ignore-scripts || npm install --ignore-scripts

COPY . .

RUN npm run build
RUN npm run build:server || true

EXPOSE 4000

CMD ["node", "server.js"]