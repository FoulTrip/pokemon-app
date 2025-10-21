# Dockerfile para desarrollo con hot reload
FROM node:20-alpine

# Instalar un servidor HTTP simple con hot reload
RUN npm install -g live-server

# Establecer directorio de trabajo
WORKDIR /app

# Exponer puerto 8080 (puerto por defecto de live-server)
EXPOSE 8080

# Comando para iniciar live-server con hot reload
CMD ["live-server", "--host=0.0.0.0", "--port=8080", "--no-browser", "--watch=."]
