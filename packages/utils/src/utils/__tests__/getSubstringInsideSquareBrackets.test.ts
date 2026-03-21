/// <reference types="jest" />
import { getSubstringInsideSquareBrackets } from '..';

const stringInsideBrackets = 'stringInsideBrackets';
const stringInsideBracketsSecond = 'stringInsideBracketsSecond';
const stringInsideBracketsWithWordWrap = `
string
WithWordWrap`;
const stringWithSquareBrackets = `string with [${stringInsideBrackets}] brackets`;
const stringWithWordWrap = `string with [${stringInsideBracketsWithWordWrap}] brackets`;
const stringWithTwoBrackets = `string with [${stringInsideBrackets}] brackets [${stringInsideBracketsSecond}]`;
const stringWithRoundBrackets = `string with (${stringInsideBrackets}) brackets`;
const stringWithBraces = `string with {${stringInsideBrackets}} braces`;

describe('getSubstringInsideSquareBrackets', () => {
  it('#1 should return substring inside square brackets', () => {
    expect(getSubstringInsideSquareBrackets(stringWithSquareBrackets)).toBe(stringInsideBrackets);
  });

  it('#2 should return first substring inside square brackets', () => {
    expect(getSubstringInsideSquareBrackets(stringWithTwoBrackets)).toBe(stringInsideBrackets);
  });

  it('#3 should return substring with word wrap inside square brackets', () => {
    expect(getSubstringInsideSquareBrackets(stringWithWordWrap)).toBe(
      stringInsideBracketsWithWordWrap,
    );
  });

  it('#4 should return undefined when string not includes square brackets', () => {
    expect(getSubstringInsideSquareBrackets(stringInsideBrackets)).toBe(undefined);
  });

  it('#5 should return undefined when string with brackets', () => {
    expect(getSubstringInsideSquareBrackets(stringWithRoundBrackets)).toBe(undefined);
  });

  it('#6 should return undefined when string with round braces', () => {
    expect(getSubstringInsideSquareBrackets(stringWithBraces)).toBe(undefined);
  });
});
