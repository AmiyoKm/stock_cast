# Builder Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY bd-stock-api/package*.json ./
RUN npm install

COPY bd-stock-api/. .

RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

COPY bd-stock-api/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["npm", "run", "start-server"]
