/// <reference types="jest" />
import replaceUnderscoresWithSpaces from '../replaceUnderscoresWithSpaces';

describe('replaceUnderscoresWithSpaces', () => {
  it('replaces underscores with spaces', () => {
    const input = '_hello_world_';
    const expectedOutput = ' hello world ';

    expect(replaceUnderscoresWithSpaces(input)).toEqual(expectedOutput);
  });

  it('handles empty string', () => {
    const input = '';
    const expectedOutput = '';

    expect(replaceUnderscoresWithSpaces(input)).toEqual(expectedOutput);
  });
});
