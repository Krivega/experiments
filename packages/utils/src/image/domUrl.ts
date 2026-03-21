// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const DOM_URL = typeof window === 'undefined' ? undefined : (window.URL ?? window.webkitURL);

export default DOM_URL;
