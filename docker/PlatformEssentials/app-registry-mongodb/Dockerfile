FROM node:carbon

# Create app directory
RUN mkdir -p /usr/app-registry-mongodb
WORKDIR /usr/app-registry-mongodb

# copy server
COPY server /usr/app-registry-mongodb/

# Install app dependencies
RUN npm install

EXPOSE 3000
CMD [ "npm", "start" ]