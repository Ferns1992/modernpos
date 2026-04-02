FROM node:22-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-alpine

RUN apk add --no-cache tini tsx

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./
COPY server.ts .

RUN npm install --omit-dev

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["tsx", "server.ts"]