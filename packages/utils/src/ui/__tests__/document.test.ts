/// <reference types="jest" />
import { uiUtils } from '../..';

describe('document', () => {
  it('addOnceEventListener: should add an event listener that is removed after being called once', () => {
    const mockEventHandler = jest.fn();
    const removeEventListener = uiUtils.addOnceEventListener('click', mockEventHandler);
    const event = new Event('click');

    document.dispatchEvent(event);
    expect(mockEventHandler).toHaveBeenCalledTimes(1);
    removeEventListener();
    document.dispatchEvent(event);
    expect(mockEventHandler).toHaveBeenCalledTimes(1);
  });

  it('createDocumentElement: should create a div element by default', () => {
    const divElement = uiUtils.createDocumentElement();

    expect(divElement.tagName).toBe('DIV');
  });

  it('createDocumentElement: should create an element with specified tag name', () => {
    const pElement = uiUtils.createDocumentElement('p');

    expect(pElement.tagName).toBe('P');
  });

  it('createDocumentElement: should add attributes to the created element', () => {
    const attributes = {
      id: 'my-element',
      align: 'right',
    };
    const element = uiUtils.createDocumentElement('div', attributes) as HTMLDivElement;

    expect(element.id).toBe('my-element');
    expect(element.align).toBe('right');
  });

  it('addToBodyElement: should append the element to the document body', () => {
    const element = document.createElement('div');

    uiUtils.addToBodyElement(element);
    expect(document.body.lastChild).toBe(element);
  });
});
