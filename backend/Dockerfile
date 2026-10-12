FROM node:20-slim

WORKDIR /app

# Install build dependencies for native addons like bcrypt
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY package*.json ./

# Install production dependencies safely across platforms
RUN npm install --omit=dev --no-audit --no-fund

# Copy application source
COPY . .

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "src/server.js"]
