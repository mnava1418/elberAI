#!/bin/bash

# Script para ejecutar dentro de Docker
export PATH="/usr/local/bin:/usr/bin:/bin"

# Navegar al directorio del proyecto
cd /usr/src/elber/news_services

# Activar entorno virtual y ejecutar
source .venv/bin/activate && uv run run_with_trigger

# Log de la ejecución - a stdout para Docker logs
echo "$(date): Daily news service executed"