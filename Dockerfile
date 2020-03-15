FROM node:12.7.0-alpine

WORKDIR /usr/src/app

COPY . .

ARG GIT_TAG

RUN apk add --no-cache zip
RUN yarn
RUN yarn build:production
RUN yarn global add chrome-webstore-upload-cli@1.2.0

CMD webstore upload --auto-publish \
    --source build/short-ext.zip \
    --extension-id $EXTENSION_ID \
    --client-id $CLIENT_ID \
    --client-secret $CLIENT_SECRET \
    --refresh-token $REFRESH_TOKEN