/// <reference types="jest" />
import { removeDeprecatedSymbols } from '..';

const deprecatedSymbols = [
  '^',
  ';',
  ',',
  '"',
  '+',
  '$',
  '%',
  '"',
  '\\',
  '/',
  "'",
  '|',
  '@',
  ')',
  '(',
  '[',
  ']',
  '{',
  '}',
  '→',
];
const valueWithForbiddenChars = '^;,"\'|@)(][}{+→$value';
const value = 'value';

describe('removeDeprecatedSymbols', () => {
  it('removing forbidden chars', () => {
    expect(removeDeprecatedSymbols(valueWithForbiddenChars, deprecatedSymbols)).toBe(value);
  });
});
