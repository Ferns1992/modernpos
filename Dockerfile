# Use Node.js for building and running
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy built assets and server code
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig.json ./

# Install production dependencies only
RUN npm install --production
RUN npm install -g tsx

# Expose the port (internally 3000, mapped to 40000 in compose)
EXPOSE 3000

# Start the server
CMD ["tsx", "server.ts"]
