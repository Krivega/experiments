const hasInteractiveActiveElement = (): boolean => {
  const tagName = document.activeElement?.tagName.toLowerCase();

  if (tagName === undefined) {
    return false;
  }

  if (
    tagName.includes('input') ||
    tagName.includes('button') ||
    tagName.includes('select') ||
    tagName.includes('textarea')
  ) {
    return true;
  }

  return false;
};

export default hasInteractiveActiveElement;
