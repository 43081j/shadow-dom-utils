/**
 * Determines if a given node is an element or not.
 *
 * @param node Node to test
 * @return bool indicating whether the node is an element
 */
function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}

/**
 * Traverses a given node in order to find all available shadow roots
 * contained within child elements.
 *
 * @param node Node to traverse from
 */
function* getShadowRoots(
  node: Node
): Generator<DocumentFragment, void, undefined> {
  if (!isElement(node)) {
    return;
  }

  const doc = node.getRootNode({composed: true}) as Document;

  if (node.shadowRoot) {
    yield node.shadowRoot;
  }

  const toWalk: Element[] = [node];
  let currentNode: Element | undefined = undefined;

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
        yield walkerNode.shadowRoot;
      }
      walkerNode = walker.nextNode();
    }
  }

  return;
}

function querySelector<K extends keyof HTMLElementTagNameMap>(
  selectors: K,
  subject?: Node & ParentNode
): HTMLElementTagNameMap[K] | null;

function querySelector<K extends keyof SVGElementTagNameMap>(
  selectors: K,
  subject?: Node & ParentNode
): SVGElementTagNameMap[K] | null;

/**
 * Queries the DOM for a matching element from a given node, traversing
 * into shadow roots when they are encountereed.
 *
 * @param selectors CSS selector to query for
 * @param [subject] Subject to query relative to, defauling to `document`
 * @return First matching element found
 */
function querySelector<E extends Element = Element>(
  selectors: string,
  subject: Node & ParentNode = document
): E | null {
  const immediateChild = subject.querySelector<E>(selectors);

  if (immediateChild) {
    return immediateChild;
  }

  for (const root of getShadowRoots(subject)) {
    const child = root.querySelector<E>(selectors);
    if (child) {
      return child;
    }
  }

  return null;
}

function querySelectorAll<K extends keyof HTMLElementTagNameMap>(
  selectors: K,
  subject?: Node & ParentNode
): Array<HTMLElementTagNameMap[K]>;

function querySelectorAll<K extends keyof SVGElementTagNameMap>(
  selectors: K,
  subject?: Node & ParentNode
): Array<SVGElementTagNameMap[K]>;

/**
 * Queries the DOM for all matching elements from a given node, traversing
 * into shadow roots when they are encountereed.
 *
 * @param selectors CSS selector to query for
 * @param [subject] Subject to query relative to, defaulting to `document`
 * @return Set of matching elements found
 */
function querySelectorAll<E extends Element = Element>(
  selectors: string,
  subject: Node & ParentNode = document
): E[] {
  const results: E[] = [...subject.querySelectorAll<E>(selectors)];

  for (const root of getShadowRoots(subject)) {
    results.push(...root.querySelectorAll<E>(selectors));
  }

  return results;
}

export {
  querySelector,
  querySelectorAll
};
