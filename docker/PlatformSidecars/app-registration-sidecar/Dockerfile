FROM ubuntu

RUN mkdir -p /usr/app-registration
WORKDIR /usr/app-registration

COPY docker/PlatformSidecars/app-registration-sidecar/sidecar.sh /usr/app-registration/

RUN chmod 777 sidecar.sh

RUN ls -l /usr/app-registration

# Install prerequisites
RUN apt-get update && apt-get install -y curl

CMD ["./sidecar.sh"]