FROM public.ecr.aws/docker/library/node:22-alpine

# Install build tools
RUN apk add --no-cache make curl

WORKDIR /app

# Cache dependencies
# 2. Copy manifest files for ALL locations first
# This ensures that if you change code in /frontend,
# Docker doesn't re-run 'npm install' for the /backend.
COPY package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/

# 3. Install dependencies for all three locations
# Using --prefix allows you to install in subfolders without moving directories
RUN npm ci --prefix backend && \
    npm ci --prefix frontend

# Copy application code
COPY . .

# This container's job is to run the server
CMD ["make", "run-e2e-server"]