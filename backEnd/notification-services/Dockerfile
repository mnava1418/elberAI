# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /usr/src/elber

# 1. Copiamos package.json y tsconfig de cada módulo
COPY ./notification-services/package*.json ./auth-services/
COPY ./notification-services/tsconfig.json ./notification-services/

# 2. Copiamos el código completo de TODOS los módulos
COPY ./notification-services ./notification-services

# 3. Instalamos dependencias del servicio principal (esto instala deps de módulos locales también)
RUN cd ./notification-services && npm install

# 4. Build del servicio principal
RUN cd ./notification-services && npm run build

# ---------- RUNTIME STAGE ----------
FROM node:20-alpine

WORKDIR /usr/src/elber

# 6. Copiamos SOLO package.json del servicio
COPY ./notification-services/package*.json ./notification-services/

# 7. Instalamos sólo dependencia de producción
RUN cd ./notification-services && npm install --production

# 8. Copiamos todo el dist generado
COPY --from=builder /usr/src/elber/notification-services/dist ./notification-services/dist

EXPOSE 4041

CMD ["node", "/usr/src/elber/notification-services/dist/bin/www.js"]
