# Schet

[![Build Status](https://travis-ci.org/shrhdk/schet.svg?branch=fix-%239)](https://travis-ci.org/shrhdk/schet)

Schet is a web application for schedule coordination.

## Requirements

- Node.js v0.10.33
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
$ schet start
```

See [http://127.0.0.1:3000/](http://127.0.0.1:3000/).

(5) Stop Schet

```
$ schet stop
```

## API

Schet has a Web API. See [API Document](doc/API.md).

## License

MIT
