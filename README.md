# qwest-resource-factory

Small library for better works with resources and qwest package

## Installation

```shell
npm install --save qwest-resource-factory
```

## Usages

```coffee
resourceFactory = require "qwest-resource-factory"

UsersResource = resourceFactory "http://api.example.com/v1/users/:id:", 
    create:
        method: "post"
    update:
        method: "put"
        params:
            id: 1

UserResource.create(name: "Foo").then () ->
    console.log "Ok"
.catch () ->
    console.log "Err"
```