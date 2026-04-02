FROM node:22-bookworm

WORKDIR /app

# Install build dependencies for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install TypeScript compiler
RUN npm install -g typescript

# Copy source code
COPY . .

# Compile TypeScript to JavaScript
RUN npx tsc server.ts --outDir . --skipLibCheck --module nodenext --moduleResolution nodenext --esModuleInterop --target es2020

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000
ENV DATABASE_PATH=/data/pos.db

# Create data directory for persistent storage
RUN mkdir -p /data

# Expose the port
EXPOSE 4000

# Start the application with node
CMD ["node", "server.js"]