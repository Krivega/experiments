import { computed } from 'mobx';

import type { IComputedValue } from 'mobx';

type TTransformer<TInput, TOutput> = (input: TInput) => TOutput;
type TCached<TOutput> = { keySize: number; view: IComputedValue<TOutput> };

// Ссылка на input может не меняться, но input может быть модифицирован.
// Например, в map или array могут добавить\удалить элементы.
// А во frozen-объекте добавить\удалить поля.
// Функция getKeySize позволяет отследить такие изменения в input
// за счет вычисления "размера ключа".
const getKeySize = (key: object): number => {
  if ('size' in key && typeof key.size === 'number') {
    return key.size;
  }

  if ('length' in key && typeof key.length === 'number') {
    return key.length;
  }

  return Object.keys(key).length;
};

/**
 * @deprecated Устарел и будет удалён в будущих версиях.
 * Используйте хук memoizeProps для компонентов рендера списка.
 */
const viewTransform = <TInput extends object, TOutput>(
  transformer: TTransformer<TInput, TOutput>,
) => {
  const cache = new Map<TInput, TCached<TOutput>>();

  return (input: TInput) => {
    // Поиск кеша для input.
    const key = input;
    const cached = cache.get(key);
    // Расчет размера ключа для input для определения был ли input модифицирован.
    const keySize = getKeySize(key);

    // Возвращает значение из кеша если для input существует кеш, а сам input не был модифицирован.
    if (cached?.keySize === keySize) {
      return cached.view.get();
    }

    // Очистка устаревшего кеша (защита от утечки памяти при замене или модификации input).
    cache.clear();

    // computed - кеширует результат выполнения transformer.
    const view = computed(
      () => {
        return transformer(input);
      },
      {
        // keepAlive - продолжает хранить кеш даже когда реакции и UI отписались от кеша.
        keepAlive: true,
      },
    );

    cache.set(key, { keySize, view });

    return view.get();
  };
};

export default viewTransform;
