import React from 'react';

// Тип для функции освобождения ресурсов
export type TDestroy = () => void;

/**
 * Базовый интерфейс для хранилища виджета
 */
export type IBaseStore = Record<string, unknown> & {
  destroy: () => void;
};

/**
 * Базовый интерфейс для фичи
 */
export interface IFeatureExport<TProps = unknown> {
  Component: React.ComponentType<TProps>;
}

// Использование 'any' здесь необходимо для обратной совместимости с существующим кодом,
// так как фактические типы пропсов могут быть более специфичны, чем 'unknown'.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TBaseFeaturesExport = Record<string, IFeatureExport<any>>;

/**
 * Базовые пропсы для конструктора композера
 */
export type TBaseComposerProps<
  TStore extends IBaseStore = IBaseStore,
  TFeatures extends TBaseFeaturesExport = TBaseFeaturesExport,
> = {
  store: TStore;
  features: TFeatures;
};

/**
 * Базовые пропсы для всех композиций
 * Могут быть расширены конкретными реализациями
 */
export interface IBaseComposition {
  className?: string;
  key?: string | number;
}

type TComponentProps = Record<string, unknown>;

/**
 * Абстрактный класс для композиции виджетов
 *
 * @template TStore - Тип хранилища, должен реализовывать IBaseStore
 * @template TFeatures - Тип карты фич, ключи - ID фич, значения - экспорты фич
 * @template TComposition - Тип карты композиций, ключи - имена компонентов, значения - типы пропсов
 */
export abstract class BaseWidgetComposer<
  TPropsView,
  TStore extends IBaseStore = IBaseStore,
  TFeatures extends TBaseFeaturesExport = TBaseFeaturesExport,
  TComposition extends Record<string, React.ComponentType<TComponentProps>> = Record<
    string,
    React.ComponentType<TComponentProps>
  >,
> {
  protected store: TStore;

  protected features: TFeatures;

  private readonly prefixFeatureWrapper = 'FeatureWrapper';

  // Кеш для мемоизации композиции и пропсов view
  private compositionCache?: TComposition;

  private propsViewCache?: TPropsView;

  public constructor({ store, features }: TBaseComposerProps<TStore, TFeatures>) {
    this.store = store;
    this.features = features;
  }

  /**
   * Инициализирует композер и возвращает функцию для очистки ресурсов
   * По аналогии с BasePresenter.init
   */
  public init(): TDestroy {
    // Можно добавить дополнительную логику инициализации, если необходимо

    return () => {
      this.store.destroy();
    };
  }

  /**
   * Получение кешированной композиции
   * Композиция создается только один раз и кешируется
   */
  public getComposition(): TComposition {
    this.compositionCache ??= this.createComposition();

    return this.compositionCache;
  }

  /**
   * Получение кешированных пропсов для View
   * Пропсы создаются только один раз и кешируются
   */
  public getPropsView(): TPropsView {
    this.propsViewCache ??= this.createPropsView();

    return this.propsViewCache;
  }

  /**
   * Универсальный метод для создания обертки компонента
   */
  protected createFeatureWrapper<
    P extends IBaseComposition,
    S extends Record<string, unknown> | undefined = undefined,
  >(Component: React.ComponentType<Omit<P, keyof S> & S>, baseProps: Omit<P, keyof S>) {
    // Отключаем правило require-optimization, так как React.memo уже выполняет оптимизацию,
    // а правило требует использования shouldComponentUpdate или React.PureComponent,
    // что не применимо для функциональных компонентов, обернутых в memo.
    // eslint-disable-next-line react/require-optimization
    const FeatureWrapper = React.memo((additionalProps: S & Partial<P>) => {
      // Объединяем базовые пропсы из Store с переданными извне
      const mergedProps = { ...baseProps, ...additionalProps };

      // Для компонентов с typed props нужно передавать пропсы явно
      // Но для поддержки динамических пропсов приходится использовать spread
      // eslint-disable-next-line react/jsx-props-no-spreading
      return <Component {...mergedProps} />;
    });

    // Устанавливаем displayName для отладки
    const componentName = Component.displayName ?? Component.name;

    FeatureWrapper.displayName = `${this.prefixFeatureWrapper}(${componentName})`;

    return FeatureWrapper;
  }

  /**
   * Очистка кеша композиции и пропсов
   * Полезно при изменении состояния, требующем пересоздания композиции
   */
  protected clearCache(): void {
    this.compositionCache = undefined;
    this.propsViewCache = undefined;
  }

  /**
   * Абстрактный метод для создания композиции
   * Должен быть реализован в дочерних классах
   */
  protected abstract createComposition(): TComposition;

  /**
   * Абстрактный метод для создания пропсов для View
   * Должен быть реализован в дочерних классах
   */
  protected abstract createPropsView(): TPropsView;
}
