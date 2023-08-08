FROM --platform=linux/amd64 node:alpine

WORKDIR /app

COPY ./package.json .
RUN npm install
COPY . .

CMD ["npm", "run", "new-start"]