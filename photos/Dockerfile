FROM node:14-alpine
WORKDIR /opt/app
RUN apk --update add make g++ python
RUN apk add libimagequant-dev --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main
RUN apk add vips-dev --repository=http://dl-cdn.alpinelinux.org/alpine/edge/communit
COPY ./package.json /opt/app/
ADD ./yarn.lock /opt/app/
ADD ./providers /opt/app/providers
RUN yarn install
ADD ./components /opt/app/components
ADD ./config /opt/app/config
ADD ./extensions /opt/app/extensions
ADD ./lib /opt/app/lib
ADD ./api /opt/app/api
ENV NODE_ENV production
RUN yarn build
EXPOSE 1337
CMD ["yarn", "start"]