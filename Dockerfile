# Definir a imagem base do Windows 10
FROM mcr.microsoft.com/windows:10.0.17763.1879

# Definir o diretório de trabalho
WORKDIR /app

# Copiar o código fonte para o diretório de trabalho
COPY . .

# Instalar as dependências do projeto
RUN npm install

# Expor a porta do servidor
EXPOSE 3000

# Definir o comando de inicialização do servidor
CMD ["npm", "start"]
