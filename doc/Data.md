# Schet Web API Data Definition

## Event Object

In example, IDs are 100, 101, 200, 201, ...
But in fact, Event, Candidate, Person ID and Comment ID
have individual number space starting with 1.

```js
{
    "id": 100,          // Event ID
    "title": "Title",
    "description": "Description",
    "fixed": 300,       // Term ID
    "people": {
        "200": "Alice", // Person ID and Name
        "201": "Bob",   // Person ID and Name
        ...
    },
    "terms": {
        "300": "1970-01-01",                            // Term ID and Term
        "301": "1970-01-01T00:00Z/1970-01-01T24:00Z",   // Term ID and Term
        ...
    },
    "record": {
        "200": {    // Person ID
            "300": "presence",  // key is Term ID
            "301": "absence",   // key is Term ID
            ...
        },
        "201": {    // Person ID
            "300": "uncertain", // key is Term ID
            "301": "presence",  // key is Term ID
            ...
        },
        ...
    },
    "comments": {
        "400": {    // Comment ID
            "time": "1970-01-01T00:00:00.000Z",   // ISO 8601 extended format in UTC
            "name": "Kenta",
            "body": "Hello"
        },
        "401": {    // Comment ID
            "time": "1970-01-01T00:00:00.000Z",   // ISO 8601 extended format in UTC
            "name": "Hideki",
            "body": "Good bye"
        },
        ...
    }
}
```
