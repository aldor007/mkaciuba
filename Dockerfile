FROM node:14-alpine
WORKDIR /opt/app
ENV NODE_ENV production
COPY ./package.json /opt/app/
ADD ./yarn.lock /opt/app/
RUN yarn install
ADD ./apps /opt/app/apps
ADD ./libs /opt/app/libs
ADD ./nx.json /opt/app/nx.json
ADD ./tsconfig.json /opt/app/tsconfig.json
ADD ./workspace.json /opt/app/workspace.json
RUN yarn 
CMD ["yarn", "start"]