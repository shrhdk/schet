# Schet Web API

This document describe the Web API of Schet.

- [Event](./Event.md)
  - [Terms](./Terms.md)
  - [Participants](./Participants.md)
  - [Comments](./Comments.md)

## Term string format

Schet Web API term string format is based on ISO 8601 extended format.

Only the following format is allowed. All times are normalize to UTC.

```
YYYY-MM-DD                              # date only
YYYY-MM-DD/YYYY-MM-DD                   # start/end
YYYY-MM-DDThh:mmZ                       # with time
YYYY-MM-DDThh:mmZ/YYYY-MM-DDThh:mmZ     # start/end
```

Examples

```
1970-01-01
1970-01-01/1970-01-02
1970-01-01T00:00Z
1970-01-01T00:00Z/1970-01-01T24:00Z
```

## Presence of participants

| Value     | Description                                 |
|-----------|---------------------------------------------|
| presence  | A participant will participate.             |
| absence   | A participant will not participate.         |
| uncertain | It is not clear whether participate.        |
| undefined | Presence is undefined after you add a term. |

## Error Format

```js
{ "error": ErrorType }
```
