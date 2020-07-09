import {expect} from 'chai';
import * as util from '../index';

customElements.define('level-one', class extends HTMLElement {
  public constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  public connectedCallback(): void {
    const child0 = document.createElement('level-two');
    const child1 = document.createElement('p');
    child1.className = 'level-one-p';
    child1.innerText = 'I am level 1';
    this.shadowRoot!.appendChild(child0);
    this.shadowRoot!.appendChild(child1);
  }
});

customElements.define('level-two', class extends HTMLElement {
  public constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  public connectedCallback(): void {
    const child0 = document.createElement('p');
    child0.className = 'level-two-p';
    child0.innerText = 'I am level 2';
    this.shadowRoot!.appendChild(child0);
  }
});

describe('shadow-utils', () => {
  describe('isElement', () => {
    it('should be true when node is an element', () => {
      const node = document.createElement('div');
      expect(util.isElement(node)).to.equal(true);
    });

    it('should be false when node is not an element', () => {
      expect(util.isElement(document)).to.equal(false);
    });
  });

  describe('isDocument', () => {
    it('should be true when node is a document', () => {
      expect(util.isDocument(document)).to.equal(true);
    });

    it('should be false when node is not a document', () => {
      const node = document.createElement('div');
      expect(util.isDocument(node)).to.equal(false);
    });
  });

  describe('computeCrossBoundarySelectors', () => {
    const testCases: Record<string, Array<string[]>> = {
      '*': [['*']],
      'div span': [['div', 'span']],
      'div:not([hidden]) span': [['div:not([hidden])', 'span']],
      'div:not(:hover, :focus) span': [['div:not(:hover, :focus)', 'span']],
      'div:is([hidden]) span': [['div:is([hidden])', 'span']],
      'div:is(:hover, :focus) span': [['div:is(:hover, :focus)', 'span']],
      'div, span': [['div'], [' span']],
      'div.foo': [['div.foo']],
      'div.foo bar': [['div.foo', 'bar']],
      'div#foo': [['div#foo']],
      'div#foo bar': [['div#foo', 'bar']],
      'div[hidden]': [['div[hidden]']],
      'div[hidden] bar': [['div[hidden]', 'bar']],
      'div[attr="foo"] bar': [['div[attr="foo"]', 'bar']],
      'div[attr="foo" i]': [['div[attr="foo" i]']],
      'div[attr="foo" s]': [['div[attr="foo" s]']],
      'div[attr~="foo"]': [['div[attr~="foo"]']],
      'div[attr^="foo"]': [['div[attr^="foo"]']],
      'div[attr$="foo"]': [['div[attr$="foo"]']],
      'div[attr*="foo"]': [['div[attr*="foo"]']],
      'div[attr|="foo"]': [['div[attr|="foo"]']],
      'div:nth-child(1) span': [['div:nth-child(1)', 'span']],
      'foo > bar baz': [['foo > bar', 'baz']],
      'foo + bar baz': [['foo + bar', 'baz']],
      'foo ~ bar baz': [['foo ~ bar', 'baz']],
      'foo bar > baz': [['foo', 'bar > baz']],
      'lotsa         whitespace': [['lotsa', 'whitespace']],
      'foo, bar, baz': [['foo'], [' bar'], [' baz']]
    };

    for (const [selector, expected] of Object.entries(testCases)) {
      it(`should compute chain for ${selector}`, async () => {
        const result = await util.computeCrossBoundarySelectors(selector);

        expect(result).to.deep.equal(expected);
      });
    }
  });

  describe('querySelector', () => {
    let node: HTMLElement;

    beforeEach(() => {
      node = document.createElement('level-one');
      document.body.appendChild(node);
    });

    afterEach(() => {
      node.remove();
    });

    it('should find same-root nodes', async () => {
      const result = await util.querySelector('level-one');
      expect(result).to.equal(node);
    });

    it('should find nodes across shadow boundaries', async () => {
      const result = await util.querySelector('level-two');
      const child = node.shadowRoot!.querySelector('level-two');
      expect(result).to.equal(child);
    });

    it('should not match cross-boundary selectors by default', async () => {
      const result = await util.querySelector('level-one level-two');
      expect(result).to.equal(null);
    });

    it('should match cross-boundary selectors when enabled', async () => {
      const result = await util.querySelector('level-one level-two', document,
          {crossBoundary: true});
      const child = node.shadowRoot!.querySelector('level-two');
      expect(result).to.equal(child);
    });
  });
});
