#!/bin/bash

# Script para ejecutar news services en servidor
set -e  # Salir si hay errores

export PATH="/home/ubuntu/.local/bin:/usr/local/bin:/usr/bin:/bin"

# Navegar al directorio del proyecto
cd /home/ubuntu/apps/elberAI/backEnd/news_services

# Verificar que el directorio existe
if [ ! -d ".venv" ]; then
    echo "$(date): ERROR - Entorno virtual no encontrado. Ejecuta 'uv sync' primero"
    exit 1
fi

# Ejecutar con uv (maneja automáticamente el entorno virtual)
echo "$(date): Iniciando ejecución del news service..."
uv run run_with_trigger

# Log de la ejecución exitosa
echo "$(date): Daily news service executed successfully"