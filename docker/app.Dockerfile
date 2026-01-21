FROM public.ecr.aws/docker/library/node:22-alpine

RUN apk add --no-cache make curl

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/

RUN npm ci --prefix backend --only=production && \
    npm ci --prefix frontend && \
    npm cache clean --force

COPY . .

CMD ["make", "run-e2e-server"]


