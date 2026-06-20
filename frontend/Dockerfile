# Stage 1: Build React Application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom nginx configuration for routing support if needed, otherwise default is fine
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
