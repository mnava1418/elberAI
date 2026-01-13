# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /usr/src/elber

# 1. Copiamos package.json y tsconfig de cada módulo
COPY ./ai-services/package*.json ./ai-services/
COPY ./ai-services/tsconfig.json ./ai-services/

# 2. Copiamos el código completo de TODOS los módulos
COPY ./ai-services ./ai-services

# 3. Instalamos dependencias del servicio principal (esto instala deps de módulos locales también)
RUN cd ./ai-services && npm install

# 4. Build del servicio principal
RUN cd ./ai-services && npm run build

# ---------- RUNTIME STAGE ----------
FROM node:20-alpine

WORKDIR /usr/src/elber

# 6. Copiamos SOLO package.json del servicio
COPY ./ai-services/package*.json ./ai-services/

# 7. Instalamos sólo dependencia de producción
RUN cd ./ai-services && npm install --production

# 8. Copiamos todo el dist generado
COPY --from=builder /usr/src/elber/ai-services/dist ./ai-services/dist

EXPOSE 4042

CMD ["node", "/usr/src/elber/ai-services/dist/bin/www.js"]
