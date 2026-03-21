/// <reference types="jest" />
import getExpiredToken, { decode, encode } from '../getExpiredToken';

describe('getExpiredToken', () => {
  const initialTokenExpiration = 1_628_672_959;

  const tokenLifeTime = 3600;

  const initialTokenPayload = {
    exp: initialTokenExpiration,
  };

  const encodedInitialTokenPayload = encode(initialTokenPayload);
  const initialTokenHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
  const initialTokenSignature = '3iW2JDLB1ZsJfC4kfQ8wuFIj4bOVTN5vJv1gZvqG0kA';

  it('should return expired token', () => {
    const token = `${initialTokenHeader}.${encodedInitialTokenPayload}.${initialTokenSignature}`;

    const expiredToken = getExpiredToken(token, tokenLifeTime);

    const [expiredTokenHeader, expiredTokenPayload, expiredTokenSignature] =
      expiredToken.split('.');
    const expiredTokenPayloadDecoded = decode(expiredTokenPayload) as typeof initialTokenPayload;

    expect(token).not.toBe(expiredToken);
    expect(expiredTokenHeader).toBe(initialTokenHeader);
    expect(expiredTokenSignature).toBe(initialTokenSignature);
    expect(expiredTokenPayloadDecoded.exp).toBe(initialTokenExpiration - tokenLifeTime);
  });
});
