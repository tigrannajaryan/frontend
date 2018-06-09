.PHONY: all build clean install manage migrate pep8 run setup-db shell test

# Project settings
LEVEL ?= development
PROJECT = betterbeauty
PYTHON = $(ENV)/bin/python3.6
PYTEST = $(ENV)/bin/pytest
ENV ?= venv

requirements = -r $(PROJECT)/requirements/$(LEVEL).txt

MYPYPATH=mypy
FLAKE8 = $(ENV)/bin/flake8
MYPY = $(ENV)/bin/mypy

DJANGO_SERVER ?= runserver
DJANGO_SHELL ?= shell_plus

SERVER_HOST ?= 0.0.0.0
SERVER_PORT ?= 8000

all: build

build: install-py migrate

manage:
	$(PYTHON) $(PROJECT)/manage.py $(COMMAND)

setup-db:
	. install_scripts/local_setup.sh

setup-vsts:
	. install_scripts/vsts_setup.sh

install-py: .install-py
.install-py: $(PROJECT)/requirements/common.txt $(PROJECT)/requirements/$(LEVEL).txt
	[ ! -d "$(ENV)/" ] && virtualenv -p python3.6 $(ENV)/ || :
	$(ENV)/bin/pip install --exists-action w $(requirements)
	touch $@

clean:
	@echo "cleaning compiled files..."
	@find . -name "*.pyc" -delete
	@find . -type d -empty -delete

migrate:
	COMMAND=migrate make manage

run: build
	COMMAND="$(DJANGO_SERVER) $(SERVER_HOST):$(SERVER_PORT)" $(MAKE) manage

shell: build
	COMMAND=shell_plus make manage

lint: flake8 mypy

mypy:
	MYPYPATH=$(MYPYPATH) $(MYPY) --ignore-missing-imports $(PROJECT)/

pytest:
	$(PYTEST) --ds=core.settings.tests --junit-xml=test-reports/junit/testresults.xml \
		--cov=$(PROJECT) --cov-report term --cov-report xml \
		--cov-report html:test-reports/coverage-html $(TEST_ARGS) $(PROJECT)

test: clean lint pytest

flake8:
	$(FLAKE8) --statistics ./$(PROJECT)/
