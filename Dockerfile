FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./

RUN npm install --omit=dev --no-audit --no-fund

COPY backend/ ./

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "src/server.js"]
