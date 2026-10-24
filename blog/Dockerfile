FROM node:20-alpine
WORKDIR /opt/app

# Build toolchain for native node modules
RUN apk --update add make g++ python3

COPY ./package.json /opt/app/
COPY ./package-lock.json /opt/app/
ADD ./providers /opt/app/providers
RUN npm ci --network-timeout 100000

# v4 project tree (src/ replaces the v3 api/, components/, extensions/, hooks/)
ADD ./src /opt/app/src
ADD ./config /opt/app/config
ADD ./lib /opt/app/lib
COPY ./favicon.ico /opt/app/favicon.ico
COPY ./package.json /opt/app/

ENV NODE_ENV production
RUN NODE_ENV=production npm run build

EXPOSE 1337
CMD ["npm", "start"]
