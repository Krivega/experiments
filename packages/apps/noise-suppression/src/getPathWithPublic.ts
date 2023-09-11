const getPathWithPublic = (path) => {
  return `${process.env.PUBLIC_URL}/${path}`;
};

export default getPathWithPublic;
