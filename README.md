# qwest-resource-factory

Small library for better works with resources and qwest package

## Installation

```shell
npm install --save qwest-resource-factory
```

## Usages

```js
import ResourceFactory from 'qwest-resource-factory'

UsersResource = ResourceFactory.create('http://api.example.com/v1/users/:id:', {
    create: {
        method: 'POST'
    },
    update: {
        method: 'PUT',
        params:
            id: 1
    }
})

UserResource.create({name: "Foo"}).then(() => {
    console.log("Ok")
}).catch(() => {
    console.log("Err")
})
```