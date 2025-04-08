# Imagen base ligera de Node.js
FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar y preparar dependencias
COPY package*.json ./
RUN npm install --production

# Copiar el resto del código fuente
COPY . .

# Establecer variables de entorno (Railway puede sobreescribirlas)
ENV NODE_ENV=production

# Exponer puerto usado por Express
EXPOSE 8080

# Comando para iniciar la app
CMD ["npm", "start"]
