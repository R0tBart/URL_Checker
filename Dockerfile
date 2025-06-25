# Dockerfile für statisches HTML/CSS/JS-Frontend mit nginx
FROM nginx:alpine

# Kopiere die statischen Dateien ins nginx-Webroot
COPY ./frontend /usr/share/nginx/html

# Port 80 freigeben (Standard für HTTP)
EXPOSE 80