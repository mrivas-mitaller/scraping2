# 🐳 Etapa 1: Construcción de dependencias
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos solo archivos de dependencias para cacheo eficiente
COPY package*.json ./

# Instalamos solo dependencias necesarias para producción
RUN npm ci --omit=dev

# 🐳 Etapa 2: Imagen final, más limpia y segura
FROM node:20-alpine

# Crear un usuario no-root por seguridad
RUN addgroup app && adduser -S -G app app

# Directorio de trabajo
WORKDIR /app

# Copiamos desde el builder solo lo necesario
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Variables de entorno (Railway puede sobreescribirlas)
ENV NODE_ENV=production

# Puerto expuesto por Express
EXPOSE 8080

# Usar el usuario seguro creado
USER app

# Comando de arranque
CMD ["node", "index.js"]
