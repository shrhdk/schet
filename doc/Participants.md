# Participants

## Add Participant

### Request

```
POST /:event_id/participants HTTP/1.1
Accept: application/json
Content-Type: application/json

{
  name: '...',
  schedule: {
    1: '...',
    2: '...',
    ...
  }
}
```

| Property  | Type   | Required | Description                                               |
|-----------|:------:|:--------:|-----------------------------------------------------------|
| name      | string | yes      | The name of the participant. Non empty and 1 line string. |
| schedule  | Object | no       | The key is Term ID. The value is [Presence]().            |

### Response

```
HTTP/1.1 201 Created
Content-Type: application/json
Location: http://example.com/:event_id/participants/:participant_id

{
  participant_id: ...,
  url: '...',
  name: '...',
  schedule: {
    1: '...',
    2: '...',
    ...
  }
}
```

| Property       | Type   | Description                                    |
|----------------|:------:|------------------------------------------------|
| participant_id | string | The ID of created participant.                 |
| url            | string | The URL of created participant.                |
| name           | string | The name of created participant.               |
| schedule       | Object | The key is Term ID. The value is [Presence](). |

### Error

- 500
- 400
- 404
  - The event is not found.
- 409
  - The event is already fixed.
  - The participant name is duplicated.

### Example

```
POST /100/participants HTTP/1.1
Accept: application/json
Content-Type: application/json

{
  name: 'Alice',
  schedule: {
    1: 'presence',
    2: 'absence',
    3: 'uncertain'
  }
}
```

```
HTTP/1.1 201 Created
Content-Type: application/json
Location: http://example.com/100/participants/3

{
  participant_id: 3,
  url: 'http://example.com/100/participants/3',
  name: 'Alice',
  schedule: {
    1: 'presence',
    2: 'absence',
    3: 'uncertain'
  }
}
```

## Get Participant

### Request

```
GET /:event_id/participants/:participant_id
Accept: application/json
```

### Response

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  participant_id: ...,
  url: '...',
  name: '...',
  schedule: {
    1: '...',
    2: '...',
    3: '...',
    ...
  }
}
```

| Property       | Type   | Description                                    |
|----------------|:------:|------------------------------------------------|
| participant_id | string | The ID of the participant.                     |
| url            | string | The URL of the participant.                    |
| name           | string | The name of the participant.                   |
| schedule       | Object | The key is Term ID. The value is [Presence](). |

### Error

- 500
- 404
  - The event is not found.
  - The participant is not found.

## Update Participant

### Request

```
PATCH /:event_id/participants/:participant_id HTTP/1.1
Accept: application/json
Content-Type: application/json

{
  name: '...',
  schedule: {
    1: '...',
    2: '...',
    3: '...',
    ...
  }
}
```

| Property  | Type   | Required | Description                                               |
|-----------|:------:|:--------:|-----------------------------------------------------------|
| name      | string | yes      | The name of the participant. Non empty and 1 line string. |
| schedule  | Object | no       | The key is Term ID. The value is [Presence]().            |

### Response

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  participant_id: ...,
  url: '...',
  name: '...',
  schedule: {
    1: '...',
    2: '...',
    3: '...',
    ...
  }
}
```

| Property       | Type   | Description                                    |
|----------------|:------:|------------------------------------------------|
| participant_id | string | The ID of the participant.                     |
| url            | string | The URL of the participant.                    |
| name           | string | The name of the participant.                   |
| schedule       | Object | The key is Term ID. The value is [Presence](). |

### Error

- 500
- 400
- 404
  - The event is not found.
  - The participant is not found.
- 409
  - The event is already fixed.
  - The participant name is duplicated.

### Example

```
PATCH /100/participants/3 HTTP/1.1
Accept: application/json
Content-Type: application/json

{
  name: 'Alice',
  schedule: {
    1: 'presence',
    2: 'absence',
    3: 'uncertain'
  }
}
```

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  participant_id: 3,
  url: 'http://www.example.com/100/participants/3',
  name: 'Alice',
  schedule: {
    1: 'presence',
    2: 'absence',
    3: 'uncertain'
  }
}
```

## Delete Participant

### Request

```
DELETE /:event_id/participants/:participant_id HTTP/1.1
```

### Response

```
HTTP/1.1 204 No Content
```

### Error

- 500
- 404
  - The event is not found.
  - The participant is not found.

### Example

```
DELETE /100/participants/3
```

```
HTTP/1.1 204 No Content
```
