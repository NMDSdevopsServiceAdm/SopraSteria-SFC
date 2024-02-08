.DEFAULT_GOAL := all
.PHONY: all install run

all: install run

install:
	npm install --prefix frontend
	npm install --prefix backend

run:
	(cd backend && npm run new-start) & \
	(cd frontend && npm run build:watch)

test:
	npm run test --prefix frontend
