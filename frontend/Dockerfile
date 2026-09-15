# Stage 1: Build React Production Artifacts
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests & install dependencies
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source code & build dist
COPY . .
RUN npm run build

# Stage 2: Serve via Production Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
