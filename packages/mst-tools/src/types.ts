import type { IAnyType, Instance, ReferenceIdentifier, SnapshotIn } from 'mobx-state-tree';

/** Базовая форма моделей MST, требующих уникальный `id` для reference-полей. */
export type TModelWithId = { id: ReferenceIdentifier };

/** Удобный алиас для инстанса MST-модели после создания дерева. */
export type TInstanceModel<T> = Instance<T>;

/** Тип снапшота для инициализации модели (например, в тестах или сидерах). */
export type TInitialState<T> = SnapshotIn<T>;

/** Ожидает, что условие компилируется в `true`; используется в типовых тестах. */
export type Expect<T extends true> = T;

/** Сравнение типов на строгую эквивалентность, полезно в типовых проверках. */
export type Equal<X, Y> =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  (<T>() => T extends X ? true : false) extends <T>() => T extends Y ? true : false ? true : false;

/** Быстрый доступ к `CreationType` («контракт входных данных» для конструктора модели) без условных проверок. */
export type TExtractCreationType<V extends IAnyType> = V['CreationType'];
/** Быстрый доступ к `Type` (форма значений после того, как узел уже живёт в дереве) без условных проверок. */
export type TExtractType<V extends IAnyType> = V['Type'];

/** Определяет итоговый тип значения при чтении узла, fallback — `CreationType` («контракт входных данных» для конструктора модели). */
export type TExtractValueType<V extends IAnyType> = V extends { Type: infer T }
  ? T
  : TExtractCreationType<V>;
