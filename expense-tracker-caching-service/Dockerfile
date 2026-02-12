ARG NODE_VERSION=24.11.1-alpine

FROM node:${NODE_VERSION}

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

EXPOSE 8001

CMD npm start
