## shadow-utils

### WIP

This is a work-in-progress, it has not yet been published under any
sensible name and nobody knows what it does or if it works. Future me
will find out, I'm sure.

This package provides a set of useful utilities for dealing with shadow DOM,
primarily for test environment situations where one might want to break
encapsulation.

### Available Utilities

#### `querySelector` and `querySelectorAll`

Behaves in a similar way to the native `querySelector` but ignores shadow
DOM boundaries, in that it traverses into shadow roots and continues
searching within them for the given selector.

Usage:

```ts
// find all elements with the class, "foo"
querySelector('.foo');

// find all elements with the class "foo" within a specific node
querySelector('.foo', node);
```
