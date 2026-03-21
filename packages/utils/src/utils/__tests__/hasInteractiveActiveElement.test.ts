/// <reference types="jest" />
import { hasInteractiveActiveElement } from '..';

const setActiveElement = (element: ReturnType<typeof document.createElement>) => {
  document.append(element);

  element.focus();
};

const resetActiveElement = () => {
  while (document.firstChild) {
    document.firstChild.remove();
  }
};

describe('hasInteractiveActiveElement', () => {
  afterEach(() => {
    resetActiveElement();
  });

  it('should return false when no active element', () => {
    const result = hasInteractiveActiveElement();

    expect(result).toBe(false);
  });

  it('should return true when active element is input', () => {
    setActiveElement(document.createElement('input'));

    const result = hasInteractiveActiveElement();

    expect(result).toBe(true);
  });

  it('should return true when active element is button', () => {
    setActiveElement(document.createElement('button'));

    const result = hasInteractiveActiveElement();

    expect(result).toBe(true);
  });

  it('should return true when active element is select', () => {
    setActiveElement(document.createElement('select'));

    const result = hasInteractiveActiveElement();

    expect(result).toBe(true);
  });

  it('should return true when active element is textarea', () => {
    setActiveElement(document.createElement('textarea'));

    const result = hasInteractiveActiveElement();

    expect(result).toBe(true);
  });
});
