# Imagen base con soporte para Puppeteer y Chromium
FROM mcr.microsoft.com/playwright:v1.42.1-jammy

# Crear y entrar a directorio de trabajo
WORKDIR /app

# Copiar dependencias y código fuente
COPY package*.json ./
RUN npm install

COPY . .

# Exponer el puerto de la API
EXPOSE 8080

# Comando de inicio
CMD ["npm", "start"]
