/// <reference types="jest" />
import parseObject, { parseObjectWithoutUri } from '../parseObject';

describe('parseObject', () => {
  it('parseObject', () => {
    const object = { property: 'property' };

    const result = parseObject(object);

    expect(result).toEqual(object);
  });

  it('parseObjectWithoutUri', () => {
    const objectWithUri = { property: 'property', uri: 'uri' };
    const objectWithoutUri = { property: 'property' };

    const result: object = parseObjectWithoutUri(objectWithUri);

    expect(result).toEqual(objectWithoutUri);
  });
});
