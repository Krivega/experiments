/// <reference types="jest" />
/* eslint-disable react/no-multi-comp */
import { render, screen } from '@testing-library/react';

import createMultipleContext from '../createMultipleContext';

type TContext = {
  text: string;
};

describe('createMultipleContext', () => {
  it('должен рендерить компонент с данными из соответствующего контекста по contextId', () => {
    const { Provider, withContext } = createMultipleContext<TContext>();

    const Component: React.FC<TContext> = ({ text }) => {
      return <div data-testid="text">{text}</div>;
    };

    const Wrapped = withContext(Component);

    render(
      <Provider contextId="feature-a" value={{ text: 'hello-a' }}>
        <Wrapped contextId="feature-a" />
      </Provider>,
    );

    expect(screen.getByTestId('text').textContent).toBe('hello-a');
  });

  it('должен изолировать значения разных контекстов (разные contextId)', () => {
    const { Provider, withContext } = createMultipleContext<TContext>();

    const Component: React.FC<TContext> = ({ text }) => {
      return <div data-testid="text">{text}</div>;
    };

    const Wrapped = withContext(Component);

    render(
      <>
        <Provider contextId="feature-a" value={{ text: 'A' }}>
          <Wrapped contextId="feature-a" />
        </Provider>

        <Provider contextId="feature-b" value={{ text: 'B' }}>
          <Wrapped contextId="feature-b" />
        </Provider>
      </>,
    );

    expect(
      screen.getAllByTestId('text').map((element) => {
        return element.textContent;
      }),
    ).toEqual(['A', 'B']);
  });

  it('должен позволять переопределять значение провайдера ниже по дереву для одного и того же contextId', () => {
    const { Provider, withContext } = createMultipleContext<TContext>();

    const Component: React.FC<TContext> = ({ text }) => {
      return <div data-testid="text">{text}</div>;
    };

    const Wrapped = withContext(Component);

    render(
      <Provider contextId="chat" value={{ text: 'outer' }}>
        <Wrapped contextId="chat" />

        <Provider contextId="chat" value={{ text: 'inner' }}>
          <Wrapped contextId="chat" />
        </Provider>
      </Provider>,
    );

    const nodes = screen.getAllByTestId('text').map((element) => {
      return element.textContent;
    });

    expect(nodes).toEqual(['outer', 'inner']);
  });

  it('не должен рендерить компонент, если Provider не был создан', () => {
    const { withContext } = createMultipleContext<TContext>();

    const Component: React.FC<TContext> = ({ text }) => {
      return <div data-testid="text">{text}</div>;
    };

    const Wrapped = withContext(Component);

    render(<Wrapped contextId="missing" />);

    expect(screen.queryByTestId('text')).toBeNull();
  });

  it('должен прокидывать displayName исходного компонента', () => {
    const { withContext } = createMultipleContext<TContext>();

    const Component: React.FC<TContext> = ({ text }) => {
      return <div>{text}</div>;
    };

    Component.displayName = 'ComponentConsumer';

    const Wrapped = withContext(Component);

    expect(Wrapped.displayName).toBe('ComponentConsumer');
  });

  it('не должен рендерить компонент, если value равен undefined', () => {
    const { Provider, withContext } = createMultipleContext<TContext>();

    const Component: React.FC<TContext> = ({ text }) => {
      return <div data-testid="text">{text}</div>;
    };

    const Wrapped = withContext(Component);

    render(
      <Provider contextId="empty" value={undefined as unknown as TContext}>
        <Wrapped contextId="empty" />
      </Provider>,
    );

    expect(screen.queryByTestId('text')).toBeNull();
  });
});
