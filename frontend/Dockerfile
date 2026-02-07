# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy nginx config
RUN echo 'server { \
    listen 3001; \
    location / { \
      root /usr/share/nginx/html; \
      index index.html index.htm; \
      try_files $uri $uri/ /index.html; \
    } \
    location /api { \
      proxy_pass http://backend:3000; \
      proxy_http_version 1.1; \
      proxy_set_header Upgrade $http_upgrade; \
      proxy_set_header Connection upgrade; \
      proxy_set_header Host $host; \
      proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copy built app from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3001/ || exit 1

# Expose port
EXPOSE 3001

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
