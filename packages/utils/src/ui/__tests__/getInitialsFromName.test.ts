/// <reference types="jest" />
import { uiUtils } from '../..';

const oneWordName = 'onewordname';
const twoWordName = 'some name';
const threeWordName = 'three word name';

describe('getInitialsFromName', () => {
  it('should take first letters of two words and uppercase them', () => {
    expect(uiUtils.getInitialsFromName(twoWordName)).toBe('SN');
  });

  it('should take first letters of the first two words name and uppercase them', () => {
    expect(uiUtils.getInitialsFromName(threeWordName)).toBe('TW');
  });

  it('should take first letters of the word if name is one word and uppercase them', () => {
    expect(uiUtils.getInitialsFromName(oneWordName)).toBe('ON');
  });
});
