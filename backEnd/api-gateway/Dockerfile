# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /usr/src/elber

# 1. Copiamos package.json y tsconfig de cada módulo
COPY ./api-gateway/package*.json ./api-gateway/
COPY ./api-gateway/tsconfig.json ./api-gateway/

# 2. Copiamos el código completo de TODOS los módulos
COPY ./api-gateway ./api-gateway

# 3. Instalamos dependencias del servicio principal (esto instala deps de módulos locales también)
RUN cd ./api-gateway && npm install

# 4. Build del servicio principal
RUN cd ./api-gateway && npm run build

# ---------- RUNTIME STAGE ----------
FROM node:20-alpine

WORKDIR /usr/src/elber

# 6. Copiamos SOLO package.json del servicio
COPY ./api-gateway/package*.json ./api-gateway/

# 7. Instalamos sólo dependencia de producción
RUN cd ./api-gateway && npm install --production

# 8. Copiamos todo el dist generado
COPY --from=builder /usr/src/elber/api-gateway/dist ./api-gateway/dist

EXPOSE 4040

CMD ["node", "/usr/src/elber/api-gateway/dist/bin/www.js"]
