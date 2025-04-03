# Imagen base oficial de Playwright que funciona con Puppeteer
FROM mcr.microsoft.com/playwright:v1.42.1-jammy

# Crear directorio app
WORKDIR /app

# Copiar dependencias y código
COPY package*.json ./
RUN npm install

COPY . .

# Exponer puerto (usado por Railway)
EXPOSE 8080

# Comando para iniciar
CMD ["npm", "start"]
