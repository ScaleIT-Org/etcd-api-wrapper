FROM node:carbon-alpine 

MAINTAINER Christoph Wiechert <wio@psitrax.de>
MAINTAINER https://github.com/henszey

RUN mkdir -p /usr/etcd-browser
WORKDIR /usr/etcd-browser

COPY docker/PlatformSidecars/etcd-browser/app /usr/etcd-browser

RUN ls -l /usr/etcd-browser

EXPOSE 49502
CMD ["node", "server.js"]
