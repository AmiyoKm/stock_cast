FROM node:18-alpine

WORKDIR /app

COPY bd-stock-api/package*.json ./
RUN npm install

COPY bd-stock-api/. .

EXPOSE 4000

CMD ["npm", "run", "dev"]
