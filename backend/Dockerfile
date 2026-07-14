FROM --platform=linux/amd64 public.ecr.aws/docker/library/node:alpine

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .
RUN npm ci
COPY . .

CMD ["npm", "run", "new-start"]