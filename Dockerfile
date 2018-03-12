FROM mhart/alpine-node:8
MAINTAINER AlbinoDrought <albinodrought@gmail.com>
LABEL maintainer="AlbinoDrought <albinodrought@gmail.com>"

WORKDIR /app
COPY ./src /app/src
COPY package.json /app
COPY package-lock.json /app

RUN npm install

CMD ["npm", "run", "dev"]
