# Term

## Add Term

### Request

```
POST /:event_id/terms HTTP/1.1
Accept: application/json
Content-Type: application/json

{
  term: '...'
}
```

| Property | Type   | Required | Description                    |
|----------|:------:|:--------:|--------------------------------|
| term     | string | yes      | The date and time of the term. |

### Response

```
HTTP/1.1 201 Created
Content-Type: application/json
Location: http://example.com/:event_id/terms/:term_id

{
  term_id: ...,
  url: '...'
  term: '...',
}
```

| Property | Type   | Description                        |
|----------|:------:|------------------------------------|
| term_id  | number | The ID of created term.            |
| url      | string | The URL of created term.           |
| term     | string | The date and time of created term. |

### Error

- 500
- 400
- 404
  - The event is not found.
  - The term is not found.
- 409
  - The event is already fixed.
  - The term is duplicated.

### Example

```
POST /100/terms HTTP/1.1
Accept: application/json
Content-Type: application/json

{
  term: '2014-01-01T12:00'
}
```

```
HTTP/1.1 201 Created
Content-Type: application/json
Location: http://example.com/100/terms/3

{
  id: 3,
  url: 'http://example.com/100/terms/3'
  term: '2014-01-01T12:00Z'
}
```

## Get Term

### Request

```
GET /:event_id/terms/:term_id HTTP/1.1
Accept: application/json
```

### Response

```
HTTP/1.1 200 Created
Content-Type: application/json

{
  term_id: ...,
  url: '...'
  term: '...',
}
```

| Property | Type   | Description                        |
|----------|:------:|------------------------------------|
| term_id  | number | The ID of created term.            |
| url      | string | The URL of created term.           |
| term     | string | The date and time of created term. |

## Update Term

### Request

```
PUT /:event_id/terms/:term_id HTTP/1.1
Accept: application/json
Content-Type: application/json

{
  term: '...'
}
```

| Property | Type   | Required | Description                    |
|----------|:------:|:--------:|--------------------------------|
| term     | string | yes      | The date and time of the term. |

### Response

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  term_id: ...,
  url: '...'
  term: '...',
}
```

| Property | Type   | Description                    |
|----------|:------:|--------------------------------|
| term_id  | number | The ID of the term.            |
| url      | string | The URL of the term.           |
| term     | string | The date and time of the term. |

### Error

- 500
- 400
- 404
  - The event is not found.
  - The term is not found.
- 409
  - The event is already fixed.
  - The term is duplicated.

### Example

```
PUT /100/terms/3 HTTP/1.1
Accept: application/json
Content-Type: application/json

{
  term: '2014-01-01T15:00Z'
}
```

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  id: 3,
  url: 'http://example.com/100/terms/3'
  term: '2014-01-01T15:00Z'
}
```

## Delete Term

### Request

```
DELETE /:event_id/terms/:term_id HTTP/1.1
```

### Response

```
HTTP/1.1 204 No Content
```

### Error

- 500
- 404
  - The event is not found.
  - The term is not found.
- 409
  - The event is already fixed.

### Example

```
DELETE /100/terms/3 HTTP/1.1
```

```
HTTP/1.1 204 No Content
```
