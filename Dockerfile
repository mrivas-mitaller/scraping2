# Etapa 1: Construcción de dependencias
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar solo dependencias necesarias para producción
COPY package*.json ./
RUN npm install --omit=dev

# Etapa 2: Imagen final más liviana y segura
FROM node:20-alpine

# Crear un usuario no root por seguridad
RUN addgroup app && adduser -S -G app app

WORKDIR /app

# Copiar código fuente y node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Variables de entorno
ENV NODE_ENV=production

# Exponer puerto del servidor Express
EXPOSE 8080

# Usar usuario seguro
USER app

# Comando de arranque
CMD ["node", "index.js"]
