PYTHON ?= python3
VENV_PYTHON := .venv/bin/python
NPM ?= npm
FRONTEND_NPM = env -u OPENAI_API_KEY $(NPM) --prefix frontend

.PHONY: setup setup-backend setup-frontend dev test test-backend test-frontend build

setup: setup-backend setup-frontend

setup-backend:
	$(PYTHON) -m venv .venv
	$(VENV_PYTHON) -m pip install --upgrade pip
	$(VENV_PYTHON) -m pip install -r backend/requirements-dev.txt

setup-frontend:
	$(FRONTEND_NPM) ci

dev:
	PYTHONUNBUFFERED=1 $(VENV_PYTHON) scripts/dev.py

test: test-backend test-frontend

test-backend:
	$(VENV_PYTHON) -m pytest backend/tests

test-frontend:
	$(FRONTEND_NPM) test

build:
	$(FRONTEND_NPM) run build
