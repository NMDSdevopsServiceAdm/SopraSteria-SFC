.DEFAULT_GOAL := all
.PHONY: all install run

all: install run

install:
	npm install --prefix frontend

run:
	(cd backend && docker-compose up) & \
	(cd frontend && npm run build:watch)
