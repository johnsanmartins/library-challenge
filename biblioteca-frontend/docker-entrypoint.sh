#!/bin/sh
# Sustituye el placeholder ${KEYCLOAK_ISSUER} en el bundle Angular con el valor
# de la variable de entorno inyectada por Docker Compose en tiempo de ejecución.
# Esto permite cambiar la URL de Keycloak sin recompilar la imagen.

set -e

PLACEHOLDER='\${KEYCLOAK_ISSUER}'
TARGET="${KEYCLOAK_ISSUER:-http://localhost:8180/realms/library}"

echo "[entrypoint] Configurando Keycloak issuer: $TARGET"

# Reemplaza en todos los archivos JS del bundle
find /usr/share/nginx/html -name '*.js' | while read -r file; do
  sed -i "s|${PLACEHOLDER}|${TARGET}|g" "$file"
done

echo "[entrypoint] Sustitución completada. Iniciando Nginx..."
exec nginx -g 'daemon off;'
