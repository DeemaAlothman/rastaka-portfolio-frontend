FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN mkdir -p uploads

EXPOSE 4000

CMD ["sh", "-c", "export DATABASE_URL=\"$DATABASE_URL\" && npx prisma generate && npx prisma migrate deploy && node src/server.js"]

