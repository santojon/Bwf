## Bwf (Beowulf)

A tool to define javascript classes easily.   
Example:

```java
new Bwf(
    'Dashboard: {
        name: string,
        tiles: list,
        base: string,
        extras: object
    }'
).create();
```

Will be a class, defined in page scope.
