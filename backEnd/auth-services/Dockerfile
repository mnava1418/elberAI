# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /usr/src/elber

# 1. Copiamos package.json y tsconfig de cada módulo
COPY ./auth-services/package*.json ./auth-services/
COPY ./auth-services/tsconfig.json ./auth-services/
COPY ./notification-services/package*.json ./notification-services/
COPY ./notification-services/tsconfig.json ./notification-services/

# 2. Instalamos dependencias del servicio principal (esto instala deps de módulos locales también)
RUN cd ./auth-services && npm install

# 3. Copiamos el código completo de TODOS los módulos
COPY ./auth-services ./auth-services
COPY ./notification-services ./notification-services

# 4. Build de los módulos locales
RUN cd ./notification-services && npm run build

# 5. Build del servicio principal
RUN cd ./auth-services && npm run build


# ---------- RUNTIME STAGE ----------
FROM node:20-alpine

WORKDIR /usr/src/elber

# 6. Copiamos SOLO package.json del servicio
COPY ./auth-services/package*.json ./auth-services/

# 7. Instalamos sólo dependencia de producción
RUN cd ./auth-services && npm install --production

# 8. Copiamos todo el dist generado
COPY --from=builder /usr/src/elber/auth-services/dist ./auth-services/dist
COPY --from=builder /usr/src/elber/notification-services/dist ./notification-services/dist

# (opcional: si tus módulos locales también necesitan node_modules en runtime)
COPY ./notification-services/package*.json ./notification-services/
RUN cd ./notification-services && npm install --production

EXPOSE 4041

CMD ["node", "/usr/src/elber/auth-services/dist/bin/www.js"]
