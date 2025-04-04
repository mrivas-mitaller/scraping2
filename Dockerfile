# Imagen base liviana con Node.js 20
FROM node:20-slim

# Instalar dependencias necesarias para Chromium sin entorno gráfico
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    wget \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias primero (mejora uso de cache)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Exponer puerto que Railway usará
EXPOSE 8080

# Comando para iniciar app
CMD ["npm", "start"]

