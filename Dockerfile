FROM node:12.7.0-alpine

WORKDIR /usr/src/app

COPY . .

ARG GIT_TAG

RUN apk add --no-cache zip
RUN yarn
RUN yarn build:production
