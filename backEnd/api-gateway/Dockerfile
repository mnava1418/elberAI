# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /usr/src/elber

# 1. Copiamos package.json y tsconfig de cada módulo
COPY ./api-gateway/package*.json ./api-gateway/
COPY ./api-gateway/tsconfig.json ./api-gateway/

COPY ./auth-services/package*.json ./auth-services/
COPY ./auth-services/tsconfig.json ./auth-services/

COPY ./notification-services/package*.json ./notification-services/
COPY ./notification-services/tsconfig.json ./notification-services/

# 2. Copiamos el código completo de TODOS los módulos
COPY ./api-gateway ./api-gateway
COPY ./auth-services ./auth-services
COPY ./notification-services ./notification-services

# 3. Instalamos dependencias del servicio principal (esto instala deps de módulos locales también)
RUN cd ./api-gateway && npm install
RUN cd ./auth-services && npm install
RUN cd ./notification-services && npm install

# 4. Build de los módulos locales
RUN cd ./auth-services && npm run build
RUN cd ./notification-services && npm run build

# 5. Build del servicio principal
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
COPY --from=builder /usr/src/elber/auth-services/dist ./auth-services/dist
COPY --from=builder /usr/src/elber/notification-services/dist ./notification-services/dist

# (opcional: si tus módulos locales también necesitan node_modules en runtime)
COPY ./auth-services/package*.json ./auth-services/
RUN cd ./auth-services && npm install --production

COPY ./notification-services/package*.json ./notification-services/
RUN cd ./notification-services && npm install --production

EXPOSE 4040

CMD ["node", "/usr/src/elber/api-gateway/dist/bin/www.js"]
