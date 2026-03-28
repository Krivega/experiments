/// <reference types="jest" />
import decodeJwtToken from '../index';

describe('decodeJwtToken', () => {
  it('by 1 example', () => {
    const token =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImp0aSI6IjJlNGQ4YmI1MTVjNDMxNzJmOWJiNGE3OGQ4MzUwNTE3In0.eyJpc3MiOiJodHRwczpcL1wvZGVtby52aW50ZW8uY29tIiwiYXVkIjoiaHR0cHM6XC9cL2RlbW8udmludGVvLmNvbSIsImp0aSI6IjJlNGQ4YmI1MTVjNDMxNzJmOWJiNGE3OGQ4MzUwNTE3IiwidWlkIjoiOTk5IiwiaWF0IjoxNjUzMzA0NDQxLCJuYmYiOjE2NTMzMDQ0NDEsImV4cCI6MTY1MzMwODA0MX0.zShMGHA4k33VSOb4oUMPo0z6cEdBF0Alw0glJ2L7opY';

    const localeDateString = decodeJwtToken(token);

    expect(localeDateString).toEqual({
      expiration: 1_653_308_041,
      url: 'https://demo.vinteo.com',
    });
  });

  it('by 2 example', () => {
    const token =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImp0aSI6IjJlNGQ4YmI1MTVjNDMxNzJmOWJiNGE3OGQ4MzUwNTE3In0.eyJpc3MiOiJodHRwczpcL1wvZGVtby52aW50ZW8uY29tIiwiYXVkIjoiaHR0cHM6XC9cL2RlbW8udmludGVvLmNvbSIsImp0aSI6IjJlNGQ4YmI1MTVjNDMxNzJmOWJiNGE3OGQ4MzUwNTE3IiwidWlkIjoiOTk5IiwiaWF0IjoxNjUzMzA0NjU5LCJuYmYiOjE2NTMzMDQ2NTksImV4cCI6MTY1MzMwODI1OX0.CHt_3FZ2-Tg2gWaGSRy4otKpBwq3iSkR8UYS9D2pgck';
    const localeDateString = decodeJwtToken(token);

    expect(localeDateString).toEqual({
      expiration: 1_653_308_259,
      url: 'https://demo.vinteo.com',
    });
  });
});
