/// <reference types="jest" />
/* eslint-disable max-classes-per-file, react/no-multi-comp */
import { render, screen } from '@testing-library/react';
import React from 'react';

import { BaseWidgetComposer } from '../BaseWidgetComposer';
import { useComposer } from '../useComposer';

import type { IBaseComposition, IBaseStore, IFeatureExport } from '../BaseWidgetComposer';

interface ITestStore extends IBaseStore {
  value: string;
  destroy: () => void;
}

interface ITestFeatureProps {
  text?: string;
  className?: string;
}

type TActionOrchestrator = { execute: () => void };

type TPropsView = { testProp: string };
type Equal<T, P> = [T] extends [P] ? ([P] extends [T] ? true : false) : false;
type Expect<T extends true> = T;

type ITestFeatures = {
  testFeature: IFeatureExport<ITestFeatureProps>;
};

const TestComponent: React.FC<ITestFeatureProps> = ({ text = 'default', className }) => {
  return (
    <div className={className} data-testid="test-component">
      {text}
    </div>
  );
};

class TestWidgetComposer extends BaseWidgetComposer<TPropsView, ITestStore, ITestFeatures> {
  public createPropsView(): TPropsView {
    return { testProp: this.store.value };
  }

  public createComposition() {
    const baseProps: IBaseComposition & Pick<ITestFeatureProps, 'text' | 'className'> = {
      text: this.store.value,
      className: 'from-composer',
    };

    return {
      TestComponent: this.createFeatureWrapper(TestComponent, baseProps),
    };
  }
}

interface IComposerWithAdditionalProps extends TPropsView {
  actionOrchestrator: TActionOrchestrator;
}

class ComposerWithAdditionalProps extends BaseWidgetComposer<
  IComposerWithAdditionalProps,
  ITestStore,
  ITestFeatures
> {
  private readonly actionOrchestrator: TActionOrchestrator;

  public constructor(
    props: { store: ITestStore; features: ITestFeatures },
    additionalProps: { actionOrchestrator: TActionOrchestrator },
  ) {
    super(props);
    this.actionOrchestrator = additionalProps.actionOrchestrator;
  }

  public createPropsView(): IComposerWithAdditionalProps {
    return {
      testProp: this.store.value,
      actionOrchestrator: this.actionOrchestrator,
    };
  }

  public createComposition() {
    const baseProps: IBaseComposition & Pick<ITestFeatureProps, 'text' | 'className'> = {
      text: this.store.value,
      className: 'with-extra',
    };

    return {
      TestComponent: this.createFeatureWrapper(TestComponent, baseProps),
    };
  }
}

const createTestStore = (value: string, destroy = jest.fn()): ITestStore => {
  return { value, destroy };
};

const createTestFeatures = (): ITestFeatures => {
  return { testFeature: { Component: TestComponent } };
};

describe('useComposer', () => {
  it('должен вызывать фабрику с объектом: store и features', () => {
    const store = createTestStore('value');
    const features = createTestFeatures();
    const createComposer = jest.fn((props: { store: ITestStore; features: ITestFeatures }) => {
      expect(props.store).toBe(store);
      expect(props.features).toBe(features);

      return new TestWidgetComposer(props);
    });

    const TestWidget = () => {
      useComposer(createComposer, { store, features });

      return undefined;
    };

    render(<TestWidget />);

    expect(createComposer).toHaveBeenCalledTimes(1);
    expect(createComposer).toHaveBeenCalledWith({ store, features });
  });

  it('должен позволять фабрике передавать в конструктор дополнительные параметры', () => {
    const actionOrchestrator = { execute: jest.fn() };

    const store = createTestStore('extra-value');
    const features = createTestFeatures();

    const TestWidget = () => {
      const { composition, propsView } = useComposer(
        (props) => {
          return new ComposerWithAdditionalProps(props, { actionOrchestrator });
        },
        { store, features },
      );
      const { TestComponent: ChildComponent } = composition;

      return (
        <div>
          <span data-testid="props-view">{propsView.testProp}</span>

          <span data-testid="has-orchestrator">
            {propsView.actionOrchestrator === actionOrchestrator ? 'yes' : 'no'}
          </span>

          <ChildComponent />
        </div>
      );
    };

    render(<TestWidget />);

    expect(screen.getByTestId('props-view')).toHaveTextContent('extra-value');
    expect(screen.getByTestId('has-orchestrator')).toHaveTextContent('yes');
    expect(screen.getByTestId('test-component')).toHaveClass('with-extra');
  });

  it('должен сохранять типы props и dependencies из options в createComposer', () => {
    type TDependencies = {
      externalValue: string;
      retries: number;
    };

    const store = createTestStore('typed-value');
    const features = createTestFeatures();
    const dependencies: TDependencies = {
      externalValue: 'stable',
      retries: 3,
    };

    const TestWidget = () => {
      useComposer(
        (props, dependenciesFromFactory) => {
          type TPropsTypeCheck = Expect<
            Equal<typeof props, { store: ITestStore; features: ITestFeatures }>
          >;
          type TDependenciesTypeCheck = Expect<
            Equal<typeof dependenciesFromFactory, TDependencies>
          >;

          const isPropsTypeValid: TPropsTypeCheck = true;
          const isDependenciesTypeValid: TDependenciesTypeCheck = true;

          expect(isPropsTypeValid).toBe(true);
          expect(isDependenciesTypeValid).toBe(true);
          expect(dependenciesFromFactory).toEqual(dependencies);

          return new TestWidgetComposer(props);
        },
        { store, features, dependencies },
      );

      return undefined;
    };

    render(<TestWidget />);
  });

  it('не должен пересоздавать композер при обновлении ссылки на createComposer', () => {
    const store = createTestStore('value');
    const features = createTestFeatures();
    const createComposerSpy = jest.fn(
      (props: { store: ITestStore; features: ITestFeatures }, _externalValue: string) => {
        return new TestWidgetComposer(props);
      },
    );

    const TestWidget: React.FC<{ externalValue: string }> = ({ externalValue }) => {
      const createComposer = (props: { store: ITestStore; features: ITestFeatures }) => {
        return createComposerSpy(props, externalValue);
      };

      useComposer(createComposer, { store, features });

      return undefined;
    };

    const { rerender } = render(<TestWidget externalValue="first" />);

    // Триггерится перерендер TestWidget из-за изменения пропса
    rerender(<TestWidget externalValue="second" />);

    expect(createComposerSpy).toHaveBeenCalledTimes(1);
  });

  it('не должен пересоздавать композер при добавлении dependencies с теми же зависимостями', () => {
    const store = createTestStore('value');
    const features = createTestFeatures();
    const dependencies = { stable: true };
    const createComposerSpy = jest.fn(
      (props: { store: ITestStore; features: ITestFeatures }, _rerenderKey: string) => {
        return new TestWidgetComposer(props);
      },
    );

    const TestWidget: React.FC<{ rerenderKey: string }> = ({ rerenderKey }) => {
      const createComposer = (props: { store: ITestStore; features: ITestFeatures }) => {
        return createComposerSpy(props, rerenderKey);
      };

      useComposer(createComposer, { store, features, dependencies });

      return undefined;
    };

    const { rerender } = render(<TestWidget rerenderKey="first" />);

    // Триггерится перерендер TestWidget из-за изменения пропса
    rerender(<TestWidget rerenderKey="second" />);

    expect(createComposerSpy).toHaveBeenCalledTimes(1);
  });

  it('должен пересоздавать композер при изменении зависимостей в options', () => {
    const store = createTestStore('value');
    const features = createTestFeatures();
    const createComposerSpy = jest.fn((props: { store: ITestStore; features: ITestFeatures }) => {
      return new TestWidgetComposer(props);
    });

    const TestWidget: React.FC<{ externalValue: string }> = ({ externalValue }) => {
      const createComposer = (props: { store: ITestStore; features: ITestFeatures }) => {
        return createComposerSpy(props);
      };

      useComposer(createComposer, { store, features, dependencies: { externalValue } });

      return undefined;
    };

    const { rerender } = render(<TestWidget externalValue="first" />);

    // Триггерится перерендер TestWidget из-за изменения пропса
    rerender(<TestWidget externalValue="second" />);

    expect(createComposerSpy).toHaveBeenCalledTimes(2);
  });
});
