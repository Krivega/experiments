export const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    // @ts-expect-error
    return parts.pop().split(';').shift();
  }

  return undefined;
};

export const setCookie = (
  name: string,
  value: string,
  options: { expires?: Date | number | string } = {},
) => {
  const data = { ...options };

  let { expires } = options;

  if (expires !== undefined && expires !== 0 && typeof expires === 'number') {
    const date = new Date();

    date.setTime(date.getTime() + expires * 1000);
    expires = date;
    data.expires = date;
  }

  // @ts-expect-error
  if (expires?.toUTCString !== undefined) {
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    data.expires = expires.toUTCString();
  }

  // eslint-disable-next-line unicorn/no-document-cookie
  document.cookie = Object.entries(data).reduce(
    (previousCookie, [propertyName, propertyValue]) => {
      let updatedCookie = `${previousCookie}; ${propertyName}`;

      // @ts-expect-error
      if (propertyValue !== true) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        updatedCookie += `=${propertyValue}`;
      }

      return updatedCookie;
    },
    `${name}=${encodeURIComponent(value)}`,
  );
};

export const deleteCookie = (name: string) => {
  setCookie(name, '', {
    expires: -1,
  });
};
