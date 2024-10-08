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

// Finds a `p` tag under a `div` _in the same root_ but at any depth
querySelector('div p');
```

### Querying children across boundaries

If you want to match children of a particular node _at any depth_ (i.e. across
shadow boundaries), you can pass an array of selectors:

```ts
querySelector(['div', 'p'], document);
```

This will match any `p` tag which exists below a `div`, regardless
of if that `div` is in the same shadow root or not (but must
still be a parent in the hierarchy).

If you try to do this in one selector (i.e. `querySelector('div p')`), you
will instead be querying all `p` tags which are a child of a `div` tag
_in the same root_ (but that root could be anywhere at any depth).

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

### Querying children across boundaries

If you want to match children of a particular node _at any depth_ (i.e. across
shadow boundaries), you can pass an array of selectors:

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
