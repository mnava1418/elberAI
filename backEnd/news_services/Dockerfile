FROM python:3.11-slim

# Instalar cron y dependencias del sistema
RUN apt-get update && apt-get install -y cron tzdata && apt-get clean

# Configurar timezone (opcional pero recomendado)
ENV TZ=America/New_York

# Configurar directorio de trabajo
WORKDIR /usr/src/elber

# Copiar archivos del proyecto
COPY . .

# Instalar uv y dependencias de Python
RUN pip install uv
RUN uv sync

# Copiar y configurar el script de cron
RUN chmod +x /usr/src/elber/run_daily_news.sh

# Configurar el cron job
RUN echo "0 7 * * * /usr/src/elber/run_daily_news.sh >> /usr/src/elber/cron.log 2>&1" | crontab -

# Crear archivo de log
RUN touch /usr/src/elber/cron.log

# Script para iniciar cron y mantener el contenedor corriendo
CMD ["sh", "-c", "cron && tail -f /usr/src/elber/cron.log"]