FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate prisma client
RUN npm ci
RUN npx prisma generate

# Copy source code
COPY . .

# Build typescript code
RUN npm run build

# Expose API port
EXPOSE 3000

# Start production server
CMD ["npm", "run", "start"]
