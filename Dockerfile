FROM node:20-alpine

RUN  apk add --update python3 make g++\
   && rm -rf /var/cache/apk/*
WORKDIR /opt/app
COPY ./package.json /opt/app/
ADD ./yarn.lock /opt/app/
ADD ./decorate-angular-cli.js /opt/app/
ADD ./apps /opt/app/apps
ADD ./libs /opt/app/libs
ADD ./nx.json /opt/app/nx.json
ADD ./tsconfig.base.json /opt/app/tsconfig.base.json
ADD ./babel.config.json /opt/app/babel.config.json
ADD ./tailwind.config.js /opt/app/tailwind.config.js
ADD ./postcss.config.js /opt/app/postcss.config.js
ENV NODE_ENV=production
RUN cp /opt/app/apps/photos/src/environments/environment.prod.ts /opt/app/apps/photos/src/environments/environment.ts
RUN cp /opt/app/apps/photos-ssr/src/environments/environment.prod.ts /opt/app/apps/photos-ssr/src/environments/environments.ts
ADD ./dist/ /opt/app/dist
RUN yarn --network-timeout 100000
CMD ["node", "dist/apps/photos-ssr/main.js"]