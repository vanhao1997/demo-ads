# Stage 1: Build Vite application & bundle standalone P2P Digital Ad Preview Hub
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && \
    cp dist/index.html dist/lab.html && \
    cp demo-app.html dist/demo-app.html && \
    cp demo-app.html dist/index.html

# Stage 2: Production Nginx server (Port 80 for Coolify / Traefik)
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
