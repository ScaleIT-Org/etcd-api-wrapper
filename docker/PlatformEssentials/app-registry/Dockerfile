FROM node:carbon

# Create app directory
RUN mkdir -p /usr/app-registry
WORKDIR /usr/app-registry

# copy server
COPY server /usr/app-registry/

# Install app dependencies
RUN npm install
RUN cd /usr/app-registry/node_modules/deasync && npm rebuild
RUN ls -l /usr/app-registry

EXPOSE 3000
CMD [ "npm", "start" ]