FROM node:12

# Create app directory
WORKDIR /usr/src/app

COPY jwt/package*.json ./

RUN npm install

COPY jwt/server.js .

EXPOSE 8080

CMD [ "node", "server.js" ]
