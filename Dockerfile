# Dockerfile
FROM mcr.microsoft.com/playwright:v1.42.1-jammy

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8080
CMD ["npm", "start"]
