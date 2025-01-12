# Usa l'immagine di base per Node.js
FROM node:18

# Imposta la directory di lavoro
WORKDIR /app

# Copia il file package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il resto del progetto
COPY . .

# Espone la porta usata da Vite
EXPOSE 5173

# Comando per avviare l'app
CMD ["npm", "run", "dev"]