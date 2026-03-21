type TTokenPayload = { exp: number };

export const encode = (decodedToken: TTokenPayload) => {
  return btoa(JSON.stringify(decodedToken));
};

export const decode = (encodedToken: string) => {
  return JSON.parse(atob(encodedToken)) as unknown;
};

const getExpiredToken = (token: string, tokenLifeTime: number) => {
  const splitToken = token.split('.');

  const decodedTokenPayload = decode(splitToken[1]) as TTokenPayload;

  decodedTokenPayload.exp -= tokenLifeTime;

  splitToken[1] = encode(decodedTokenPayload);

  return splitToken.join('.');
};

export default getExpiredToken;
