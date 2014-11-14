# Comments

## Add Comment

### Request

```
POST /:event_id/comments HTTP/1.1
Accept: application/json

{
  name: '...',
  body: '...'
}
```

| Property | Type   | Required | Description                                           |
|----------|:------:|:--------:|-------------------------------------------------------|
| name     | string | yes      | The name of contributor. Non empty and 1 line string. |
| body     | string | yes      | The body of the comment. Non empty string.            |

### Response

```
HTTP/1.1 201 Created
Content-Type: application/json
Location: http://example.com/:event_id/comments/:comment_id

{
  comment_id: ...,
  url: '...',
  name: '...',
  body: '...'
}
```

| Property   | Type   | Description                                |
|------------|:------:|--------------------------------------------|
| comment_id | string | The ID of created comment.                 |
| url        | string | The URL of created comment.                |
| name       | string | The contributor's name of created comment. |
| body       | string | The body  of created comment.              |

### Error

- 500
- 400
- 404
  - The event is not found.

## Update Comment

### Request

```
PATCH /:event_id/comments/:comment_id HTTP/1.1
Accept: application/json
Content-Type: application/json

{
  name: '...',
  body: '...'
}
```

| Parameter   | Type   | Required | Description                                           |
|-------------|:------:|:--------:|-------------------------------------------------------|
| name        | string | no       | The name of contributor. Non empty and 1 line string. |
| body        | string | no       | The body of the comment. Non empty string.            |

### Response

```
HTTP/1.1 200 OK
Content-Type: application/json
...

{
  comment_id: ...,
  url: '...',
  name: '...',
  body: '...'
}
```

| Property   | Type   | Description                            |
|------------|:------:|----------------------------------------|
| comment_id | string | The ID of the comment.                 |
| url        | string | The URL of the comment.                |
| name       | string | The contributor's name of the comment. |
| body       | string | The body  of the comment.              |

### Error

- 500
- 400
- 404
  - The event is not found.
  - The comment is not found.

### Example

```
PATCH /100/comments/3 HTTP/1.1
Accept: application/json
Content-Type: application/json

{
  name: 'Bob',
  body: 'Hello'
}
```

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  comment_id: 3,
  url: 'http://example.com/100/comments/3',
  name: 'Bob',
  body: 'Hello'
}
```

## Delete Comment

### Request

```
DELETE /:event_id/comments/:comment_id HTTP/1.1
```

### Response

```
HTTP/1.1 204 No Content
```

### Error

- 500
- 404
  - The event is not found.
  - The comment is not found.

### Example

```
DELETE /100/comments/3 HTTP/1.1
```

```
HTTP/1.1 204 No Content
```
