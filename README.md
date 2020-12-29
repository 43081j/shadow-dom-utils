## shadow-dom-utils

This package provides a set of useful utilities for dealing with shadow DOM,
primarily for test environment situations where one might want to break
encapsulation.

### Install

```bash
npm i shadow-dom-utils
```

### `querySelector` and `querySelectorAll`

Behaves in a similar way to the native `querySelector` but ignores shadow
DOM boundaries, in that it traverses into shadow roots and continues
searching within them for the given selector.

#### Usage

```ts
// find all elements with the class, "foo"
querySelector('.foo');

// find all elements with the class "foo" within a specific node
querySelector('.foo', node);

// pass an options object
querySelector('.foo', node, options);
```

#### Options

Both of these functions can take an options object like so:

```ts
querySelector('.foo', document, options);
```

The following options are supported:

```ts
{
  // If true, enables cross-boundary selector support.
  // For example, `.foo .bar` would match even if `.foo` and `.bar` are
  // in different shadow roots (but still descendant-like).
  "crossBoundary": false
}
```

### `getHost`

Retrieves the host document or element of a given node.

This behaves similar to calling `getRootNode()` manually, but will only
return a result if it is a document or a shadow-root host, meaning
disconnected nodes will return `null`.

#### Usage

```ts
// get the host of a given node
getHost(node);
```
