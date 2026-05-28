# Stage 1: Build static assets
FROM node:20-alpine AS build
WORKDIR /app

# Copy package configurations and install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build static assets
COPY . .
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy static assets to Nginx default document root
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for single page application (SPA) routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
