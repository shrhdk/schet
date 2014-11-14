# Event

## Create Event

### Request

```
POST / HTTP/1.1
Accept: application/json
Content-Type: application/json

{
  title: '...',
  description: '...'
}
```

| Property    | Type   | Required | Description                                          |
|-------------|:------:|:--------:|------------------------------------------------------|
| title       | string | yes      | The title of the event. Non empty and 1 line string. |
| description | string | no       | The description of the event.                        |

### Response

```
HTTP/1.1 201 Created
Content-Type: application/json
Location: http://example.com/:event_id

{ ... see example ... }
```

### Error

- 500
- 400

### Example

```
POST / HTTP1.1
Accept: application/json
Content-Type: application/json

{
  title: 'hoge'
  description: 'fuga'
}
```

```
HTTP/1.1 201 Created
Content-Type: application/json
Location: http://example.com/100

{
  event_id: 100,
  url: 'http://example.com/100',
  title: 'hoge',
  description: 'fuga',
  terms: [],
  participants: [],
  comments: [],
  record: {}
}
```

## Get Event

### Request

```
GET /:event_id HTTP/1.1
Accept: application/json
```

### Response

```
HTTP/1.1 200 OK
Content-Type: application/json

{ ... see example ... }
```

### Error

- 500
- 404
  - The event is not found.

### Example

```
GET /100 HTTP/1.1
Accept: application/json
```

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  event_id: 100,
  url: 'http://example.com/100'
  title: 'hoge',
  description: 'fuga',
  terms: [
    { id: 200, term: '2014-01-01T12:00Z' },
    { id: 201, term: '2014-01-02T12:00Z' }
  ],
  participants: [
    {
      id: 300,
      name: 'Alice',
      schedule: { 200: 'presence', 201: 'absence' }
    },
    {
      id: 301,
      name: 'Bob',
      schedule: { 200: 'uncertain', 201: 'undefined' }
    }
  ],
  comments: [
    { id: '400', name: 'Alice', body: 'hello' },
    { id: '401', name: 'Bob', body: 'world' }
  ]
}
```

## Update Event

### Request

```
PATCH /:event_id HTTP/1.1
Accept: application/json
Content-Type: application/json

{
  title: '...',
  description: '...'
}
```

| Property    | Type   | Required | Description                                          |
|-------------|:------:|:--------:|------------------------------------------------------|
| title       | string | no       | The title of the event. Non empty and 1 line string. |
| description | string | no       | The description of the event.                        |

### Response

```
HTTP/1.1 200 OK
Content-Type: application/json

{ ... see example ... }
```

### Error

- 500
- 400
- 404
  - The event is not found.
- 409
  - The event is already fixed.

### Example

```
PATCH /100 HTTP/1.1
Accept: application/json
Content-Type: application/json

{
  title: 'hogehoge',
  description: 'fugafuga'
}
```

```
HTTP/1.1 200 OK

{
  event_id: 100,
  url: 'http://example.com/100'
  title: 'hogehoge',
  description: 'fugafuga',
  terms: [
    { id: 200, term: '2014-01-01T12:00Z' },
    { id: 201, term: '2014-01-02T12:00Z' }
  ],
  participants: [
    {
      id: 300,
      name: 'Alice',
      schedule: { 200: 'presence', 201: 'absence' }
    },
    {
      id: 301,
      name: 'Bob',
      schedule: { 200: 'uncertain', 201: 'undefined' }
    }
  ],
  comments: [
    { id: '400', name: 'Alice', body: 'hello' },
    { id: '401', name: 'Bob', body: 'world' }
  ]
}
```

## Delete Event

### Request

```
DELETE /:event_id HTTP/1.1
```

### Response

```
HTTP/1.1 204 No Content
```

### Error

- 500
- 404
  - The event is not found.

## Example

```
DELETE /100 HTTP/1.1
```

```
HTTP/1.1 204 No Content
```
