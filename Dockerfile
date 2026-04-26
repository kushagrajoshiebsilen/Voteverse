# Slim Production Image
FROM nginx:alpine
# Copy the already-built game from our local 'dist' folder
COPY dist /usr/share/nginx/html
# Configure for Cloud Run port 8080
RUN sed -i 's/listen\(.*\)80;/listen 8080;/' /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
