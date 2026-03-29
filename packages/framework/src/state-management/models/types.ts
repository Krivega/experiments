// Утилитарные типы для извлечения типов методов
export type TExtractMethodType<T, K extends keyof T> = T[K] extends (
  ...args: infer Args
) => infer Return
  ? (...args: Args) => Return
  : never;

/**
 * Извлекает тип геттера (view) из типа объекта
 */
export type TExtractViewType<T, K extends keyof T> = T[K] extends infer Return ? Return : never;

// Утилитарный тип для задания зависимостей между полями формы
export type TDepends<FIELDS> = Partial<{
  [KEY in keyof FIELDS]: Exclude<keyof FIELDS, KEY>[];
}>;
