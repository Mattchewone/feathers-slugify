# feathers-slugify

[![Download Status](https://img.shields.io/npm/dm/feathers-slugify.svg?style=flat-square)](https://www.npmjs.com/package/feathers-slugify)

> Feathers hook to slugify properties

**Only tested with FeathersJS V3**

## Installation

```
npm install feathers-slugify --save
```


## Single Rule w/single property
```js
const slugify = require('feathers-slugify')

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      slugify({ slug: 'name' })
    ]
  }
}

// With data for create
const data = {
  name: 'Dave Smith'
}
// Will become
const data = {
  name: 'Dave Smith',
  slug: 'dave-smith'
}
```

## Single Rule w/multiple properties
```js
const slugify = require('feathers-slugify')

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      slugify({ slug: ['meta.firstname', 'meta.surname'] })
    ]
  }
}

// With data for create
const data = {
  meta: {
    firstname: 'Dave',
    surname: 'Smith'
  }
}
// Will become
const data = {
  meta: {
    firstname: 'Dave',
    surname: 'Smith'
  },
  slug: 'dave-smith'
}
```

## Multiple Rules
```js
const slugify = require('feathers-slugify')

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      slugify([
        {
          source: ['name.first', 'name.last'],
          dest: 'fullname',
          overwrite: true // defaults to false
        },
        {
          source: 'title',
          dest: 'titleSlug'
        }
      ])
    ]
  }
}

// With data for create
const data = {
  name: {
    first: 'John',
    last: 'Smith'
  },
  title: 'My Awesome Title'
}
// Will become
const data = {
  name: {
    first: 'John',
    last: 'Smith'
  },
  fullname: 'john-smith',
  title: 'My Awesome Title',
  titleSlug: 'my-awesome-title'
}
```

## Notes
This package uses the [url-slug](https://www.npmjs.com/package/url-slug) package to **_slugify_**.
```
RFC 3986 compliant slug generator with support for multiple languages. It creates safe slugs for use in urls—and can revert them.
```

## License

Copyright (c) 2017

Licensed under the [MIT license](LICENSE).
