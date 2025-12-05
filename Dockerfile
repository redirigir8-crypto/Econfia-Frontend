# Stage 1: Build
FROM node:18-alpine as build

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copiar build a nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración personalizada de nginx si la necesitas
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
