import type { ComponentType, MemoExoticComponent } from 'react';

/** Извлекает ключи пропсов, значения которых — массивы */
type TArrayPropKeys<TProps> = {
  [K in keyof TProps]-?: TProps[K] extends readonly unknown[] ? K : never;
}[keyof TProps];

/** Извлекает ключи пропсов, значения которых — не массивы (сравниваются через ===) */
type TStrictEqualPropKeys<TProps> = Exclude<keyof TProps, TArrayPropKeys<TProps>>;

/** Конфиг для сравнения пропсов */
export type TMemoizedPropsConfig<TProps> = {
  /** Ключи пропсов-массивов, по составу которых определяется равенство */
  arrays?: TArrayPropKeys<TProps>[];
  /** Ключи пропсов, по которым сравнивание выполняется через строгое равенство (===) */
  strictEqual?: TStrictEqualPropKeys<TProps>[];
};

/** Предикат сравнения пропсов. Возврат true = пропсы равны, re-render пропускается */
export type TMemoPredicate<TProps> = (
  prevProps: Readonly<TProps>,
  nextProps: Readonly<TProps>,
) => boolean;

/** Мемоизированный компонент с опциональным кастомным компаратором */
export type TMemoizedComponent<TProps> = MemoExoticComponent<ComponentType<TProps>> & {
  compare?: TMemoPredicate<TProps>;
};

export type TArrayValue = unknown[] | null | undefined;
