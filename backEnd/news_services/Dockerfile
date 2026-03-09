FROM python:3.11-slim

# Instalar cron y dependencias del sistema
RUN apt-get update && apt-get install -y cron tzdata && apt-get clean

# Configurar timezone (opcional pero recomendado)
ENV TZ=America/New_York

# Configurar directorio de trabajo
WORKDIR /usr/src/elber

# Copiar archivos del proyecto
COPY . .

# Cambiar al directorio de news_services donde está pyproject.toml
WORKDIR /usr/src/elber/news_services

# Instalar uv y dependencias de Python
RUN pip install uv
RUN uv sync

# Configurar el script de cron
RUN chmod +x /usr/src/elber/news_services/run_daily_news.sh

# Configurar el cron job
RUN echo "0 7 * * * /usr/src/elber/news_services/run_daily_news.sh >> /usr/src/elber/news_services/logs/cron.log 2>&1" | crontab -

# Crear directorio de logs y archivo de log
RUN mkdir -p /usr/src/elber/news_services/logs
RUN touch /usr/src/elber/news_services/logs/cron.log

# Script para iniciar cron y mantener el contenedor corriendo
CMD ["sh", "-c", "cron && tail -f /usr/src/elber/news_services/logs/cron.log"]