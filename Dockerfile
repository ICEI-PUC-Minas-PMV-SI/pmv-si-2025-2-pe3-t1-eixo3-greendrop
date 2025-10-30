# Use official Node LTS
FROM node:22-alpine

# Set working directory to the src folder since package.json lives there
WORKDIR /app/src

# Install dependencies first (leverage layer cache)
COPY src/package*.json ./
RUN npm ci --only=production || npm install --only=production

# Copy application source
COPY src/ ./

# Expose the app port
EXPOSE 3000

# Environment defaults (can be overridden by compose/env)
ENV NODE_ENV=production

# Start the app directly to avoid requiring a .env file inside the image
CMD ["node", "index.js"]
