/// <reference types="jest" />
import transformAppVersionToNumericValue from '../transformAppVersionToNumericValue';

describe('transform app version to numeric value', () => {
  it('should transform app version to numeric value', () => {
    expect(transformAppVersionToNumericValue('3.9.0')).toEqual([3, 9, 0]);
    expect(transformAppVersionToNumericValue('3.8.0')).toEqual([3, 8, 0]);
    expect(transformAppVersionToNumericValue('3.7.0')).toEqual([3, 7, 0]);
  });

  it('should transform app  version with suffix to numeric value', () => {
    expect(transformAppVersionToNumericValue('3.9.0-alpha1')).toEqual([3, 9, 0]);
    expect(transformAppVersionToNumericValue('3.8.0-beta23')).toEqual([3, 8, 0]);
  });
});
