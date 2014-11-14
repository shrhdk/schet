# Date

Fix Event and Unfix Event.

## Fix Event

### Request

```
POST /:event_id/date HTTP/1.1
```

| Parameter | Type   | Location | Required | Description                         |
|-----------|:------:|:--------:|:--------:|-------------------------------------|
| :event_id | number | path     | -        | An ID of the Event to fix.          |
| fixed     | number | body     | yes      | An ID of the Term to fix the Event. |

### Response

```
HTTP/1.1 200 OK
Content-Type: application/json
...

{ ... JSON of Fixed Event ... }
```

### Error

| Status Code | Error Type            | caused by |
|:-----------:|-----------------------|-----------|
| 5xx         | ServerSideError       | Sever     |
| 400         | InvalidParameterError | Client    |
| 404         | NotFoundError         | Client    |
| 410         | NotFoundError         | Conflict  |
| 409         | FixedEventError       | Conflict  |
| 409         | TermNotFoundError     | Conflict  |

### Example

```
POST /1/date
```

```

```

## Unfix Event

### Request

```
PUT /:event_id HTTP/1.1
```

| Parameter | Type/`Value` | Location | Required | Description                         |
|-----------|:------------:|:--------:|:--------:|-------------------------------------|
| :event_id | number       | path     | -        | An ID of the Event to unfix.        |
| fixed     | ` `          | body     | yes      | Set empty value to unfix the Event. |

### Response

```
HTTP/1.1 200 OK
Content-Type: application/json
...

{ ... JSON of Unfixed Event ... }
```

### Error

| Status Code | Error Type            | caused by |
|:-----------:|-----------------------|-----------|
| 5xx         | ServerSideError       | Sever     |
| 400         | InvalidParameterError | Client    |
| 404         | NotFoundError         | Client    |
| 410         | NotFoundError         | Conflict  |
