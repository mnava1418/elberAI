# ---------- BUILD STAGE ----------
FROM node:18-alpine AS builder

WORKDIR /usr/src/elber

# 1. Copiamos package.json y tsconfig de cada módulo
COPY ./ai-services/package*.json ./ai-services/
COPY ./ai-services/tsconfig.json ./ai-services/
COPY ./auth-services/package*.json ./auth-services/
COPY ./auth-services/tsconfig.json ./auth-services/
COPY ./notification-services/package*.json ./notification-services/
COPY ./notification-services/tsconfig.json ./notification-services/

# 2. Instalamos dependencias del servicio principal (esto instala deps de módulos locales también)
RUN cd ./ai-services && npm install

# 3. Copiamos el código completo de TODOS los módulos
COPY ./ai-services ./ai-services
COPY ./auth-services ./auth-services
COPY ./notification-services ./notification-services

# 4. Build de los módulos locales
RUN cd ./auth-services && npm run build
RUN cd ./notification-services && npm run build

# 5. Build del servicio principal
RUN cd ./ai-services && npm run build


# ---------- RUNTIME STAGE ----------
FROM node:18-alpine

WORKDIR /usr/src/elber

# 6. Copiamos SOLO package.json del servicio
COPY ./ai-services/package*.json ./ai-services/

# 7. Instalamos sólo dependencia de producción
RUN cd ./ai-services && npm install --production

# 8. Copiamos todo el dist generado
COPY --from=builder /usr/src/elber/ai-services/dist ./ai-services/dist
COPY --from=builder /usr/src/elber/auth-services/dist ./auth-services/dist
COPY --from=builder /usr/src/elber/notification-services/dist ./notification-services/dist

# (opcional: si tus módulos locales también necesitan node_modules en runtime)
COPY ./auth-services/package*.json ./auth-services/
RUN cd ./auth-services && npm install --production

COPY ./notification-services/package*.json ./notification-services/
RUN cd ./notification-services && npm install --production

EXPOSE 4042

CMD ["node", "/usr/src/elber/ai-services/dist/bin/www.js"]
