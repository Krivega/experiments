/// <reference types="jest" />
import findBySelector from '../findBySelector';

describe('findBySelector', () => {
  const container = document.createElement('div');

  container.className = 'test-container';
  document.body.append(container);

  container.innerHTML = `
  <div class="test-selector">test1</div>
  <div class="test-selector">test2</div>
`;

  it('should return the element with the given selector and index', () => {
    expect(findBySelector(container, '.test-selector').textContent).toBe('test1');
    expect(findBySelector(container, '.test-selector', 0).textContent).toBe('test1');
    expect(findBySelector(container, '.test-selector', 1).textContent).toBe('test2');
  });

  it('should throw error for out-of-bounds indexNumber', () => {
    expect(() => {
      return findBySelector(container, '.test-selector', 2);
    }).toThrow('Error: no element with selector: .test-selector (2-nth-child) in test-container');
  });

  it('throws an error when no element is found with the given selector', () => {
    expect(() => {
      return findBySelector(container, '.non-existent-element');
    }).toThrow(
      'Error: no element with selector: .non-existent-element (0-nth-child) in test-container',
    );
  });
});
