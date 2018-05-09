# App Registry ETCD API

Core Service App Registry with ETCD for persisting data and REST API

## Features

* standard quay.io/coreos/etcd functionality (port 49501)
* browse and edit ETCD key/values (port 49502)
* provide an rest interface for ETCD (port 49503), call /docs to get swagger UI

## Requirements

- create certificate and key
- Install Rancher secrets from public Rancher catalog
- Add Secrets sslcert, sslkey and jwtSecret in Rancher "Infrastructure -> Secrets -> Add Secret"

## Changelog

- 2018-04-09: use server v1.0.0