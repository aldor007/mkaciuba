FROM node:16-alpine

RUN  apk add --update python3 make g++\
   && rm -rf /var/cache/apk/*
WORKDIR /opt/app
COPY ./package.json /opt/app/
ADD ./yarn.lock /opt/app/
ADD ./decorate-angular-cli.js /opt/app/
RUN yarn install --network-timeout 100000
ADD ./apps /opt/app/apps
ADD ./libs /opt/app/libs
ADD ./nx.json /opt/app/nx.json
ADD ./tsconfig.base.json /opt/app/tsconfig.base.json
ADD ./workspace.json /opt/app/workspace.json
ADD ./babel.config.json /opt/app/babel.config.json
ADD ./tailwind.config.js /opt/app/tailwind.config.js
ADD ./postcss.config.js /opt/app/postcss.config.js
ENV NODE_ENV=production
RUN cp /opt/app/apps/photos/src/environments/environment.prod.ts /opt/app/apps/photos/src/environments/environment.ts
RUN cp /opt/app/apps/photos-ssr/src/environments/environment.prod.ts /opt/app/apps/photos-ssr/src/environments/environments.ts
RUN yarn nx build photos --prod --optimization --nocache  --outputHashing=bundles


RUN yarn nx build photos-ssr --prod --optimization --nocache
ADD ./dist/apps/photos/manifest.json /opt/app/dist/apps/photos/manifest.json
RUN rm -rf node_modules && yarn --network-timeout 100000 
CMD ["node", "dist/apps/photos-ssr/main.js"]