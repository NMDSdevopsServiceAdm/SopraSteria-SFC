FROM --platform=linux/amd64 public.ecr.aws/docker/library/node:alpine

WORKDIR /app

COPY ./package.json .
RUN npm install
COPY . .

CMD ["npm", "run", "new-start"]