/// <reference types="jest" />
import { render, screen } from '@testing-library/react';
import React from 'react';

import withContextId from '../withContextId';

const Target: React.FC<{ contextId: string }> = ({ contextId }) => {
  return <div data-testid="target">{contextId}</div>;
};

describe('withContextId', () => {
  it('внедряет переданный contextId в обёрнутый компонент', () => {
    const Wrapped = withContextId(Target, 'ctx-123');

    render(<Wrapped />);

    const element = screen.getByTestId('target');

    expect(element).toBeDefined();
    expect(element.textContent).toBe('ctx-123');
  });

  it('сохраняет displayName', () => {
    Target.displayName = 'MyTarget';

    const Wrapped = withContextId(Target, 'any');

    const { displayName } = Wrapped as unknown as { displayName?: string };

    expect(displayName).toBe('MyTarget');
  });
});
