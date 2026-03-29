import { BaseWidgetComposer } from '../BaseWidgetComposer';

import type { IBaseComposition, IBaseStore, TBaseFeaturesExport } from '../BaseWidgetComposer';

type IBaseTViewProps = Record<string, unknown> | undefined;

// Тестовый класс для доступа к protected методам
class TestBaseWidgetComposer<
  TViewProps extends IBaseTViewProps,
  TStore extends IBaseStore,
  TFeatures extends TBaseFeaturesExport,
> extends BaseWidgetComposer<TViewProps, TStore, TFeatures> {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  public createPropsView(): TViewProps {
    return {} as TViewProps;
  }

  public exposedCreateFeatureWrapper<
    P extends IBaseComposition,
    S extends Record<string, unknown> | undefined = undefined,
  >(Component: React.ComponentType<Omit<P, keyof S> & S>, baseProps: Omit<P, keyof S>) {
    return this.createFeatureWrapper(Component, baseProps);
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  public createComposition(): Record<string, React.ComponentType> {
    return {
      TestComponent: () => {
        return undefined;
      },
    };
  }
}

export const spyCreateFeatureWrapper = <
  TViewProps extends object | undefined,
  TStore extends IBaseStore,
  TFeatures extends TBaseFeaturesExport,
>(
  mockStore: TStore,
  mockFeatures: TFeatures,
  composer: BaseWidgetComposer<TViewProps, TStore, TFeatures>,
) => {
  const testBaseComposer = new TestBaseWidgetComposer({ store: mockStore, features: mockFeatures });

  const argumentsCalledWith: IBaseComposition[] = [];

  const createFeatureWrapperSpy = jest
    .spyOn(testBaseComposer, 'exposedCreateFeatureWrapper')
    // @ts-expect-error
    .mockImplementation((Component, baseProps) => {
      argumentsCalledWith.push(baseProps);

      return () => {
        return undefined;
      };
    });

  Object.defineProperty(composer, 'createFeatureWrapper', {
    value: createFeatureWrapperSpy,
    configurable: true,
  });

  Object.defineProperty(composer, 'argumentsCalledWith', {
    value: argumentsCalledWith,
    configurable: true,
  });

  return createFeatureWrapperSpy;
};
