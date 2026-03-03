# Makefile para News Services

.PHONY: install run test lint format clean help

# Variables
VENV_PATH = /Users/mnavapena/Documents/coding/apps/elberAI/.venv
PYTHON = $(VENV_PATH)/bin/python  
PIP = $(VENV_PATH)/bin/pip
UVICORN = $(VENV_PATH)/bin/uvicorn
PYTEST = $(PYTHON) -m pytest
BLACK = $(PYTHON) -m black
FLAKE8 = $(PYTHON) -m flake8

help: ## Mostrar esta ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

install: ## Instalar dependencias
	$(PIP) install -r requirements.txt

run: ## Ejecutar el servidor de desarrollo
	$(PYTHON) app.py

test: ## Ejecutar tests
	$(PYTEST) tests/ -v

test-coverage: ## Ejecutar tests con cobertura
	$(PYTEST) tests/ -v --cov=src --cov-report=html

lint: ## Verificar código con flake8
	$(FLAKE8) src/ tests/ app.py

format: ## Formatear código con black
	$(BLACK) src/ tests/ app.py

format-check: ## Verificar formato sin cambios
	$(BLACK) --check src/ tests/ app.py

clean: ## Limpiar archivos temporales
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -name ".pytest_cache" -exec rm -rf {} +

dev-setup: install ## Configuración completa para desarrollo
	@echo "Proyecto configurado para desarrollo"

docker-build: ## Construir imagen Docker
	docker build -t news-services .

docker-run: ## Ejecutar contenedor Docker
	docker run -p 8003:8003 --env-file .env news-services

docker-compose: ## Ejecutar con docker-compose
	cd .. && docker-compose up news-services