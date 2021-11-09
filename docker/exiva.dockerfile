# STAGE 1
FROM node:14-alpine as builder
RUN mkdir -p /home/exiva/node_modules && chown -R node:node /home/exiva
WORKDIR /home/exiva/
COPY package*.json ./
RUN npm config set unsafe-perm true
RUN npm install -g typescript
RUN npm install -g ts-node
USER node
RUN npm install
COPY --chown=node:node . .
RUN npm run build

FROM node:14-alpine as builder
RUN mkdir -p /home/exiva/node_modules && chown -R node:node /home/exiva
WORKDIR /home/exiva/
COPY package*.json ./
RUN npm config set unsafe-perm true
USER node
RUN npm install
COPY --chown=node:node . .
RUN npm run build

EXPOSE ${EXIVA_INSTANCE_PORT}
CMD [ "node", "build/source/main/index.js" ]