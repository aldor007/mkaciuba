FROM node:14-alpine
WORKDIR /opt/app
COPY ./package.json /opt/app/
ADD ./yarn.lock /opt/app/
ADD ./decorate-angular-cli.js /opt/app/
RUN yarn install
ADD ./apps /opt/app/apps
ADD ./libs /opt/app/libs
ADD ./nx.json /opt/app/nx.json
ADD ./tsconfig.base.json /opt/app/tsconfig.base.json
ADD ./workspace.json /opt/app/workspace.json
ADD ./babel.config.json /opt/app/babel.config.json
ENV NODE_ENV production
RUN yarn nx build photos --production
RUN yarn nx build photos-ssr --production
RUN yarn
CMD ["node", "dist/apps/photos-ssr/main.js"]