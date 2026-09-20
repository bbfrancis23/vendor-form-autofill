# ---- Build stage: compile the Angular app into static files ----
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Runtime stage: nginx serves the files and forwards /api to the backend ----
FROM nginx:stable-alpine
ENV API_UPSTREAM=http://api:3000
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
