PYTHON ?= python3
VENV_PYTHON := .venv/bin/python
NPM ?= npm

.PHONY: setup dev test test-backend test-frontend build

setup:
	$(PYTHON) -m venv .venv
	$(VENV_PYTHON) -m pip install --upgrade pip
	$(VENV_PYTHON) -m pip install -r backend/requirements-dev.txt
	$(NPM) --prefix frontend ci

dev:
	PYTHONUNBUFFERED=1 $(VENV_PYTHON) scripts/dev.py

test: test-backend test-frontend

test-backend:
	$(VENV_PYTHON) -m pytest backend/tests

test-frontend:
	$(NPM) --prefix frontend test

build:
	$(NPM) --prefix frontend run build
