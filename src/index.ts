/**
 * Determines if a given node is an element or not.
 *
 * @param node Node to test
 * @return bool indicating whether the node is an element
 */
export function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}

/**
 * Determines if a given node is a document or not.
 *
 * @param node Node to test
 * @return bool indicating whether the node is document
 */
export function isDocument(node: Node): node is Document {
  return node.nodeType === Node.DOCUMENT_NODE;
}

/**
 * Retrieves the host element of a given node, whether it be a
 * shadow root host or a document.
 *
 * @param node Node to retrieve host for
 * @return host element or document
 */
export function getHost(node: Node): Document | Element | null {
  const root = node.getRootNode();

  if (root.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    const rootAsShadow = root as ShadowRoot;
    return rootAsShadow?.host ?? null;
  }

  if (root.nodeType === Node.DOCUMENT_NODE) {
    return root as Document;
  }

  return null;
}

/*
 * .foo .bar
 * [.foo, .bar]
 *
 * .foo > .bar .baz
 * [.foo > .bar, .baz]
 */

/**
 * Traverses a given node in order to find all available shadow roots
 * contained within child elements.
 *
 * @param node Node to traverse from
 * @param deep Whether to traverse recursively into shadow roots or not
 * @yields Discovered shadow root
 */
function* getShadowRoots(
  node: Node,
  deep?: boolean
): Generator<DocumentFragment, void, undefined> {
  if (!isElement(node) && !isDocument(node)) {
    return;
  }

  const doc = isDocument(node)
    ? node
    : (node.getRootNode({composed: true}) as Document);

  if (isElement(node) && node.shadowRoot) {
    yield node.shadowRoot;
  }

  const toWalk: Node[] = [node];
  let currentNode: Node | undefined = undefined;

  while ((currentNode = toWalk.pop())) {
    const walker = doc.createTreeWalker(
      currentNode,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_DOCUMENT_FRAGMENT,
      {
        acceptNode(node) {
          // we only care about nodes which have a shadow root
          if (isElement(node) && node.shadowRoot) {
            return NodeFilter.FILTER_ACCEPT;
          }

          // we skip other nodes, but continue to traverse their children
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    let walkerNode: Node | null = walker.nextNode();

    while (walkerNode) {
      if (isElement(walkerNode) && walkerNode.shadowRoot) {
        if (deep) {
          toWalk.push(walkerNode.shadowRoot);
        }
        yield walkerNode.shadowRoot;
      }
      walkerNode = walker.nextNode();
    }
  }

  return;
}

/**
 * Attempts to find an element across shadow boundaries
 * by the given selector.
 *
 * @param selector Selector to query for
 * @param [subject] Subject to query relative to
 * @return element found
 */
function queryCrossBoundary<E extends Element>(
  selector: string,
  subject: Node & ParentNode = document
): E | null {
  const immediate = subject.querySelector<E>(selector);

  if (immediate) {
    return immediate;
  }

  const shadowRoots = [...getShadowRoots(subject, true)];

  for (const root of shadowRoots) {
    const child = root.querySelector<E>(selector);

    if (child) {
      return child;
    }
  }

  return null;
}

/**
 * Attempts to find an element across shadow boundaries
 * by the given selector.
 *
 * @param selector Selector to query for
 * @param [subject] Subject to query relative to
 * @return elements found
 */
function queryAllCrossBoundary<E extends Element>(
  selector: string,
  subject: Node & ParentNode = document
): E[] {
  const results: E[] = [...subject.querySelectorAll<E>(selector)];
  const shadowRoots = [...getShadowRoots(subject, true)];

  for (const root of shadowRoots) {
    const children = root.querySelectorAll<E>(selector);

    for (const child of children) {
      results.push(child);
    }
  }

  return results;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface QuerySelectorOptions {}

export function querySelector<K extends keyof HTMLElementTagNameMap>(
  selectors: K,
  subject?: Node & ParentNode,
  options?: Partial<QuerySelectorOptions>
): HTMLElementTagNameMap[K] | null;

export function querySelector<K extends keyof SVGElementTagNameMap>(
  selectors: K,
  subject?: Node & ParentNode,
  options?: Partial<QuerySelectorOptions>
): SVGElementTagNameMap[K] | null;

export function querySelector<E extends Element = Element>(
  selectors: string | string[],
  subject?: Node & ParentNode,
  options?: Partial<QuerySelectorOptions>
): E | null;

/**
 * Queries the DOM for a matching element from a given node, traversing
 * into shadow roots when they are encountereed.
 *
 * @param selectors CSS selector to query for
 * @param [subject] Subject to query relative to, defauling to `document`
 * @param [options] Options for fine-tuning querying
 * @return First matching element found
 */
export function querySelector(
  selectors: string | string[],
  subject: Node & ParentNode = document,
  _options?: Partial<QuerySelectorOptions>
): Element | null {
  const selectorList = Array.isArray(selectors) ? selectors : [selectors];

  if (selectorList.length === 0) {
    return null;
  }

  let currentSubjects = [subject];
  let result: Element | null = null;

  for (const selector of selectorList) {
    const newSubjects: Array<Node & ParentNode> = [];

    for (const currentSubject of currentSubjects) {
      const child = queryCrossBoundary(selector, currentSubject);

      if (child) {
        result = child;
        newSubjects.push(child);
      }
    }

    if (newSubjects.length === 0) {
      return null;
    }

    currentSubjects = newSubjects;
  }

  return result;
}

export function querySelectorAll<K extends keyof HTMLElementTagNameMap>(
  selectors: K,
  subject?: Node & ParentNode,
  options?: Partial<QuerySelectorOptions>
): Array<HTMLElementTagNameMap[K]>;

export function querySelectorAll<K extends keyof SVGElementTagNameMap>(
  selectors: K,
  subject?: Node & ParentNode,
  options?: Partial<QuerySelectorOptions>
): Array<SVGElementTagNameMap[K]>;

export function querySelectorAll<E extends Element = Element>(
  selectors: string | string[],
  subject?: Node & ParentNode,
  options?: Partial<QuerySelectorOptions>
): E[];

/**
 * Queries the DOM for all matching elements from a given node, traversing
 * into shadow roots when they are encountereed.
 *
 * @param selectors CSS selector to query for
 * @param [subject] Subject to query relative to, defaulting to `document`
 * @param [_options] Options for fine-tuning querying
 * @return Set of matching elements found
 */
export function querySelectorAll(
  selectors: string | string[],
  subject: Node & ParentNode = document,
  _options?: Partial<QuerySelectorOptions>
): Element[] {
  const selectorList = Array.isArray(selectors) ? selectors : [selectors];

  if (selectorList.length === 0) {
    return [];
  }

  let currentSubjects = [subject];
  let results: Element[] = [];

  for (const selector of selectorList) {
    const newSubjects: Element[] = [];

    for (const currentSubject of currentSubjects) {
      const children = queryAllCrossBoundary(selector, currentSubject);

      for (const child of children) {
        newSubjects.push(child);
      }
    }

    if (newSubjects.length === 0) {
      return [];
    }

    currentSubjects = newSubjects;
    results = newSubjects;
  }

  return results;
}

/**
 * Finds the element at a given point on the page, taking
 * shadow roots into account.
 *
 * @param x x-coordinate of the point
 * @param y y-coordinate of the point
 * @return Element found
 */
export function elementFromPoint(x: number, y: number): Element | null {
  let node = document.elementFromPoint(x, y);
  let child = node?.shadowRoot?.elementFromPoint(x, y);

  while (child && child !== node) {
    node = child;
    child = node?.shadowRoot?.elementFromPoint(x, y);
  }

  return child ?? node;
}
