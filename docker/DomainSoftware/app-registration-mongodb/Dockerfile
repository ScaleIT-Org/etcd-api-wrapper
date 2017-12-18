FROM ubuntu

RUN mkdir -p /usr/app-registration
WORKDIR /usr/app-registration

COPY ./sidecar.sh /usr/app-registration/

RUN chmod 777 sidecar.sh

CMD ["./sidecar.sh"]