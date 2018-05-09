# ScaleIT ETCD API wrapper

ScaleIT App which provides an API for ETCD

## Features

* provide an rest interface for ETCD (port 50501), call /docs to get swagger UI

## Requirements

- if running in https mode
    - create certificate and key
    - Install Rancher secrets from public Rancher catalog
    - Add Secrets sslcert, sslkey and jwtSecret in Rancher "Infrastructure -> Secrets -> Add Secret"

## Changelog

- 2018-04-09: use server v1.0.0