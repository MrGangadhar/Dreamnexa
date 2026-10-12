FROM node:20-slim

WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy backend source
COPY backend/ ./

# Cloud Run port configuration
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "src/server.js"]
