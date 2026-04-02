FROM node:22-alpine

WORKDIR /app

# Install build dependencies for native modules (better-sqlite3) and git
RUN apk add --no-cache python3 make g++ git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000
ENV DATABASE_PATH=/data/pos.db

# Create data directory for persistent storage
RUN mkdir -p /data

# Expose the port
EXPOSE 4000

# Start the application using tsx directly
CMD ["npx", "tsx", "server.ts"]