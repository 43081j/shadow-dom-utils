# shadow-dom-utils

This package provides a set of useful utilities for dealing with shadow DOM,
primarily for test environment situations where one might want to break
encapsulation.

## Install

```bash
npm i shadow-dom-utils
```

## Usage

### `querySelector`

This provides a way to query the DOM for a single element while
ignoring shadow DOM boundaries.

```ts
import {querySelector} from 'shadow-dom-utils';

// Finds a `p` tag in the document, or any shadow roots
querySelector('p');

// Finds a `p` tag in a specific node and any shadow roots
// underneath it.
querySelector('p', node);

// Specify options
querySelector('p', node, options);
```

### Cross-boundary selectors

You can match across shadow DOM boundaries by passing an array of selectors:

```ts
querySelector(['div', 'p'], document);
```

This will match any `p` tag which exists below a `div`, regardless
of if that `div` is in the same shadow root or not (but must
still be a parent in the hierarchy).

### `querySelectorAll`

This provides a way to query the DOM for all elements matching
a selector, ignoring shadow DOM boundaries.

```ts
import {querySelectorAll} from 'shadow-dom-utils';

// Finds all `p` tags in the document, or any shadow roots
querySelectorAll('p');

// Finds all `p` tags in a specific node and any shadow roots
// underneath it.
querySelectorAll('p', node);

// Specify options
querySelector('p', node, options);
```

### Cross-boundary selectors

You can match across shadow DOM boundaries by passing an array of selectors:

```ts
querySelectorAll(['div', 'p'], document);
```

This will match all `p` tags which exist below a `div`, regardless
of if that `div` is in the same shadow root or not (but must
still be a parent in the hierarchy).

### `elementFromPoint`

Behaves the same way as [elementFromPoint](https://developer.mozilla.org/en-US/docs/Web/API/DocumentOrShadowRoot/elementFromPoint) but
ignores shadow boundaries to find the deepest element at the
given coordinates.

```ts
import {elementFromPoint} from 'shadow-dom-utils';

// Get the element at [10, 20]
elementFromPoint(10, 20);
```

### `getHost`

Retrieves the host element of a given node, whether it be
a shadow root host or a document.

An element in a shadow root will have another element as its
host, the element which the shadow root belongs to.

An element in the document will have the document as its host.

```ts
import {getHost} from 'shadow-dom-utils';

// Get the host element or document
getHost(node);
```

### Limitations of cross-boundary selectors

To give an understanding of the limitations of the `crossBoundary`
option, see these examples:

```css
/*
 * Will NOT match cross-boundary, foo and bar must be in the same
 * root as otherwise they would not be a direct parent-child.
 */
foo > bar

/*
 * Will match cross-boundary, as foo and bar do not necessarily
 * have to be a direct parent-child.
 */
foo bar

/*
 * Will match each selector cross-boundary
 */
a b, c d
```

Essentially, the only time a selector is permitted to cross shadow boundaries
is when it is a descendent selector (`foo bar`, separated by a space).
