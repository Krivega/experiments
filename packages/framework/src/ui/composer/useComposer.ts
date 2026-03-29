import { useEffect, useMemo } from 'react';

import type {
  BaseWidgetComposer,
  IBaseStore,
  TBaseComposerProps,
  TBaseFeaturesExport,
} from './BaseWidgetComposer';

type TComponentProps = Record<string, unknown>;

type TUseComposerOptionsBase<TStore extends IBaseStore, TFeatures extends TBaseFeaturesExport> = {
  store: TStore;
  features: TFeatures;
};

type TUseComposerDependencies = Record<string, unknown> | undefined;

type TUseComposerOptions<
  TStore extends IBaseStore,
  TFeatures extends TBaseFeaturesExport,
  TDependencies extends TUseComposerDependencies,
> = TUseComposerOptionsBase<TStore, TFeatures> &
  ([TDependencies] extends [undefined]
    ? { dependencies?: undefined }
    : { dependencies: TDependencies });

type TCreateComposerArgs<
  TStore extends IBaseStore,
  TFeatures extends TBaseFeaturesExport,
  TDependencies extends TUseComposerDependencies,
> = [TDependencies] extends [undefined]
  ? [props: TBaseComposerProps<TStore, TFeatures>]
  : [props: TBaseComposerProps<TStore, TFeatures>, dependencies: TDependencies];

/**
 * Универсальный хук для создания и использования композера
 *
 * @param createComposer - Фабрика композера
 * @param options - store, features и опциональные зависимости
 * @returns Результат композиции
 */
export function useComposer<
  TPropsView,
  TStore extends IBaseStore,
  TFeatures extends TBaseFeaturesExport,
  TComposition extends Record<string, React.ComponentType<TComponentProps>>,
  TDependencies extends TUseComposerDependencies = undefined,
>(
  createComposer: (
    ...args: TCreateComposerArgs<TStore, TFeatures, TDependencies>
  ) => BaseWidgetComposer<TPropsView, TStore, TFeatures, TComposition>,
  options: TUseComposerOptions<TStore, TFeatures, TDependencies>,
) {
  const { store, features, dependencies } = options;

  const composer = useMemo(() => {
    const composerProps = { store, features };
    const createComposerArgs = (
      dependencies === undefined ? [composerProps] : [composerProps, dependencies]
    ) as TCreateComposerArgs<TStore, TFeatures, TDependencies>;

    return createComposer(...createComposerArgs);

    // Обновление ссылки на createComposer не должно приводить к пересозданию композера
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, features, dependencies]);

  useEffect(() => {
    return composer.init();
  }, [composer]);

  const composition = useMemo(() => {
    return composer.getComposition();
  }, [composer]);

  const propsView = useMemo(() => {
    return composer.getPropsView();
  }, [composer]);

  return useMemo(() => {
    return { composition, propsView };
  }, [composition, propsView]);
}
