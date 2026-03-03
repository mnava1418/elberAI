#!/bin/bash

# Script para ejecutar el servidor de news-services

echo "Iniciando el servidor de News Services..."

# Activar el entorno virtual y ejecutar el servidor
cd "$(dirname "$0")"
source ../../.venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8003 --reload