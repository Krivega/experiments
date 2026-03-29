/// <reference types="jest" />
import { render, screen } from '@testing-library/react';
import React from 'react';

import withDependencies from '../withDependencies';

type TDependencies = { label: string; count: number };

type TProps = TDependencies & { overrideLabel?: string };

const ComponentWithInjectedProps: React.FC<TProps> = ({ label, count, overrideLabel }) => {
  const displayLabel = overrideLabel ?? label;
  const content = `${displayLabel}-${count}`;

  return <div data-testid="component">{content}</div>;
};

describe('withDependencies', () => {
  it('внедряет dependencies в обёрнутый компонент', () => {
    const WrappedComponent = withDependencies(ComponentWithInjectedProps, {
      label: 'injected',
      count: 42,
    });

    render(<WrappedComponent />);

    const element = screen.getByTestId('component');

    expect(element).toBeDefined();
    expect(element.textContent).toBe('injected-42');
  });

  it('пробрасывает props поверх dependencies', () => {
    const WrappedComponent = withDependencies(ComponentWithInjectedProps, {
      label: 'from-deps',
      count: 1,
    });

    render(<WrappedComponent overrideLabel="from-props" />);

    const element = screen.getByTestId('component');

    expect(element.textContent).toBe('from-props-1');
  });

  it('сохраняет displayName', () => {
    ComponentWithInjectedProps.displayName = 'TestComponent';

    const WrappedComponent = withDependencies(ComponentWithInjectedProps, {
      label: 'a',
      count: 0,
    });

    const { displayName } = WrappedComponent as unknown as { displayName?: string };

    expect(displayName).toBe('TestComponent');
  });
});
