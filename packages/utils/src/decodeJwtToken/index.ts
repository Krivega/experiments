import { jwtDecode } from 'jwt-decode';

const decodeJwtToken = (token: string): { expiration: number; url: string } => {
  const { exp, iss } = jwtDecode<{ exp: number; iss: string }>(token);

  return { expiration: exp, url: iss };
};

export default decodeJwtToken;
