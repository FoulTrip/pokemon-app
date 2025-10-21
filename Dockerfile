# Dockerfile para producción (compatible con Google Cloud Run)
FROM nginx:alpine

# Copiar archivos estáticos al directorio de nginx
COPY . /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto (Cloud Run asigna dinámicamente)
EXPOSE 8080

# Comando por defecto de nginx
CMD ["nginx", "-g", "daemon off;"]
