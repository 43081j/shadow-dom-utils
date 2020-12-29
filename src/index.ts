import parser = require('postcss-selector-parser');

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

/**
 * Computes a set of cross-boundary selector representations for
 * a given selector.
 *
 * @param sel Selector to parse
 * @return representation of descendant selectors for cross-boundary
 * processing.
 */
export async function computeCrossBoundarySelectors(
  sel: string
): Promise<Array<string[]>> {
  const results: Array<string[]> = [];
  const processor = parser();
  const parsedSelectors = processor.astSync(sel);

  for (const node of parsedSelectors.nodes) {
    let accum = '';
    const nodeResults: string[] = [];

    if (node.type === 'selector') {
      for (const child of node.nodes) {
        if (child.type === 'combinator' && child.value === ' ') {
          nodeResults.push(accum);
          accum = '';
        } else {
          accum += child.toString();
        }
      }

      nodeResults.push(accum);
      results.push(nodeResults);
    }
  }

  return results;
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
 * Returns the host element of this node
 *
 * @param node Node to retrieve host for
 * @return host element
 */
function getParentHost(node: Node): Element | null {
  const root = node.getRootNode();
  const rootAsShadow = root as ShadowRoot;
  if (root.nodeType === Node.DOCUMENT_FRAGMENT_NODE && rootAsShadow.host) {
    return rootAsShadow.host;
  }
  return null;
}

/**
 * Asserts that the parents of the given node satisfy the chain of
 * selectors.
 *
 * @param node Node to test
 * @param chain Selectors to assert for
 * @return whether the parents satisfied the chain or not
 */
function parentsSatisfyChain(node: Element, chain: string[]): boolean {
  let selector;
  let currentNode = node;

  while ((selector = chain.pop())) {
    const immediate = currentNode.closest(selector);

    if (immediate) {
      currentNode = immediate;
    } else {
      let parentHost;
      let nextNode;
      let currentHostChild = currentNode;

      while ((parentHost = getParentHost(currentHostChild))) {
        if (parentHost.matches(selector)) {
          nextNode = parentHost;
          break;
        }

        const child = parentHost.closest(selector);

        if (child) {
          nextNode = child;
          break;
        }

        currentHostChild = parentHost;
      }

      if (nextNode) {
        currentNode = nextNode;
      } else {
        return false;
      }
    }
  }

  return true;
}

/**
 * Attempts to find an element across shadow boundaries
 * by the given selector.
 *
 * @param selector Selector to query for
 * @param [subject] Subject to query relative to
 * @return element found
 */
async function queryCrossBoundary<E extends Element>(
  selector: string,
  subject: Node & ParentNode = document
): Promise<E | null> {
  const computed = await computeCrossBoundarySelectors(selector);
  const immediateChild = subject.querySelector<E>(selector);

  if (immediateChild) {
    return immediateChild;
  }

  const shadowRoots = [...getShadowRoots(subject, true)];

  for (const chain of computed) {
    const deepestPart = chain[chain.length - 1];

    for (const root of shadowRoots) {
      const children = root.querySelectorAll<E>(deepestPart);

      for (const child of children) {
        if (chain.length === 1) {
          return child;
        }

        if (parentsSatisfyChain(child, chain.slice(0, -1))) {
          return child;
        }
      }
    }
  }

  return null;
}

export interface QuerySelectorOptions {
  crossBoundary: boolean;
}

export function querySelector<K extends keyof HTMLElementTagNameMap>(
  selectors: K,
  subject?: Node & ParentNode,
  options?: Partial<QuerySelectorOptions>
): Promise<HTMLElementTagNameMap[K] | null>;

export function querySelector<K extends keyof SVGElementTagNameMap>(
  selectors: K,
  subject?: Node & ParentNode,
  options?: Partial<QuerySelectorOptions>
): Promise<SVGElementTagNameMap[K] | null>;

export function querySelector<E extends Element = Element>(
  selectors: string,
  subject?: Node & ParentNode,
  options?: Partial<QuerySelectorOptions>
): Promise<E | null>;

/**
 * Queries the DOM for a matching element from a given node, traversing
 * into shadow roots when they are encountereed.
 *
 * @param selectors CSS selector to query for
 * @param [subject] Subject to query relative to, defauling to `document`
 * @param [options] Options for fine-tuning querying
 * @return First matching element found
 */
export async function querySelector(
  selectors: string,
  subject: Node & ParentNode = document,
  options?: Partial<QuerySelectorOptions>
): Promise<Element | null> {
  const immediateChild = subject.querySelector(selectors);

  if (immediateChild) {
    return immediateChild;
  }

  if (options?.crossBoundary) {
    const child = await queryCrossBoundary(selectors);

    if (child) {
      return child;
    }

    return null;
  }

  for (const root of getShadowRoots(subject, true)) {
    const child = root.querySelector(selectors);
    if (child) {
      return child;
    }
  }

  return null;
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
  selectors: string,
  subject: Node & ParentNode,
  _options?: Partial<QuerySelectorOptions>
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
  selectors: string,
  subject: Node & ParentNode = document,
  _options?: Partial<QuerySelectorOptions>
): Element[] {
  const results: Element[] = [...subject.querySelectorAll(selectors)];

  for (const root of getShadowRoots(subject)) {
    results.push(...root.querySelectorAll(selectors));
  }

  return results;
}
