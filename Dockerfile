FROM node:21

WORKDIR /app

COPY index.html index.html
COPY index..js index.js

RUN npm init --y
RUN npm install express
RUN npm install websocket
ENTRYPOINT [ "node","index.js" ]