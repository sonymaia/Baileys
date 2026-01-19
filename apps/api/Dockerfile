FROM node:20-alpine

# Dependência necessária para pacotes via git
RUN apk add --no-cache git

WORKDIR /app

# Copia apenas manifests primeiro (melhor cache)
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm install --omit=dev

# Copia o restante do código
COPY . .

# Variável de ambiente de produção
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "src/server.js"]
