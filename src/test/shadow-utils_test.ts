import {expect} from 'chai';
import * as util from '../index';

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
});
