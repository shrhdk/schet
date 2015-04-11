# Schet

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

Schet is a web application for schedule coordination.

## Screenshot

- [Index](doc/screenshot/index.png)
- [Schedule Coordination](doc/screenshot/event.png)
- [Fixed Schedule](doc/screenshot/fixed_event.png)

## Requirements

- Node.js v0.12.0
- MongoDB v2.6.5

## Getting Started

(1) Install MongoDB and start

```
$ apt-get install mongodb
$ mongod
```

(2) Install Node.js

```
$ apt-get install nodejs
```

(3) Install Schet & Initialize DB

```
$ npm install schet -g
$ schet init
```

(4) Start Schet

```
$ schet
```

See [http://127.0.0.1:3000/](http://127.0.0.1:3000/).

## Default Settings

```
$ export PORT=3000
$ export MONGODB=mongodb://127.0.0.1:27017/schet
```

## API

Schet has a Web API. See [API Document](doc/API.md).

## Credit

This project uses the [Material Design Icons](https://github.com/google/material-design-icons) developed by Google under the `CC BY 4.0`.

## License

MIT

[npm-url]: https://npmjs.org/package/schet
[npm-image]: https://badge.fury.io/js/schet.svg
[travis-url]: https://travis-ci.org/shrhdk/schet
[travis-image]: https://travis-ci.org/shrhdk/schet.svg?branch=master
