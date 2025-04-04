# Imagen base oficial compatible con Chromium y Puppeteer
FROM mcr.microsoft.com/playwright:v1.42.1-jammy

# Crear directorio de trabajo
WORKDIR /app

# Copiar y preparar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Variables de entorno (opcional si se usa Railway secrets)
ENV NODE_ENV=production

# Exponer puerto usado por Express
EXPOSE 8080

# Comando para iniciar la app
CMD ["npm", "start"]
