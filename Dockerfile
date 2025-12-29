FROM node:20-alpine

WORKDIR /app

# Make DATABASE_URL available during build for prisma generate
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Copy package files and prisma schema first (better cache)
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (Prisma CLI often needs dev deps)
RUN npm ci

# Copy application files
COPY . .

# Generate Prisma Client (needs DATABASE_URL)
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
