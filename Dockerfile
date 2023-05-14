FROM node:19-alpine

RUN apk add --no-cache helm
WORKDIR /app

# Setup a path for using local npm packages
RUN mkdir -p /opt/node_modules

COPY ./package.json /app
COPY ./yarn.lock /app

RUN yarn install

COPY ./ /app

RUN yarn run build

EXPOSE 3002

CMD ["yarn", "run", "start"]