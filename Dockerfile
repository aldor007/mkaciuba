FROM node:14-alpine

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
RUN cp /opt/app/apps/photos/environments/environments.prod.ts /opt/app/apps/photos/environments/environments.ts
RUN cp /opt/app/apps/photos-ssr/environments/environments.prod.ts /opt/app/apps/photos-ssr/environments/environments.ts
RUN yarn nx build photos --prod --optimization --nocache  --outputHashing=bundles

ADD ./dist/apps/photos/manifest.json /opt/app/dist/apps/photos/manifest.json

RUN yarn nx build photos-ssr --prod --optimization --nocache
RUN rm -rf node_modules && yarn --network-timeout 100000
CMD ["node", "dist/apps/photos-ssr/main.js"]