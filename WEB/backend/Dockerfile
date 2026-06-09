FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Ensure upload directory exists inside container
RUN mkdir -p uploads

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
