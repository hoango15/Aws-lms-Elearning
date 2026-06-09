# Build Stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve Stage
FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Custom Nginx config to serve on port 3000 and handle React Router HTML5 History API
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
