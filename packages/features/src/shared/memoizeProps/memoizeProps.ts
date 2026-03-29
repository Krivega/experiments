import { observer } from 'mobx-react';
import { memo } from 'react';

import hasMatchedArrays from './hasMatchedArrays';

import type { ComponentType } from 'react';
import type {
  TArrayValue,
  TMemoizedComponent,
  TMemoizedPropsConfig,
  TMemoPredicate,
} from './types';

const createComparatorFromConfig = <TProps>(
  config: TMemoizedPropsConfig<TProps>,
): TMemoPredicate<TProps> => {
  const { arrays: arraysPredicates = [], strictEqual: strictEqualPredicates = [] } = config;

  return (prevProps: Readonly<TProps>, nextProps: Readonly<TProps>) => {
    return (Object.keys(nextProps) as (keyof TProps)[]).every((key) => {
      const isArray = Array.isArray(prevProps[key]);
      const isArrayWithPredicate =
        isArray && arraysPredicates.includes(key as (typeof arraysPredicates)[number]);

      if (isArrayWithPredicate) {
        const prevValue = prevProps[key] as TArrayValue;
        const nextValue = nextProps[key] as TArrayValue;

        return hasMatchedArrays(prevValue, nextValue);
      }

      // Строгое сравнение пропсов доступно, если:
      // - это массив и предикаты для всех массивов не указаны;
      // - это не массив и предикат для текущего пропса указан;
      // - это не массив и предикаты для всех пропсов не указаны.

      const isEmptyArraysPredicates = arraysPredicates.length === 0;
      const isArrayWithoutPredicate = isArray && isEmptyArraysPredicates;
      const isPropertyWithStrictEqualPredicate =
        !isArray && strictEqualPredicates.includes(key as (typeof strictEqualPredicates)[number]);
      const isEmptyStrictEqualPredicates = strictEqualPredicates.length === 0;

      if (
        isArrayWithoutPredicate ||
        isPropertyWithStrictEqualPredicate ||
        isEmptyStrictEqualPredicates
      ) {
        return prevProps[key] === nextProps[key];
      }

      // Изменение прочих пропсов, не входящих в списки предикатов arrays и strictEqual, игнорируются
      return true;
    });
  };
};

/**
 * Мемоизирует компонент с MobX observer и кастомным сравнением пропсов.
 *
 * Предназначен для компонентов, принимающих в props массивы из MobX-State-Tree (модели или views).
 * MST и computed views часто возвращают новую ссылку на массив при каждом обращении, что вызывает
 * лишние re-render'ы при обновлении родителя. Сравнение по составу массивов (как по множеству
 * элементов, порядок игнорируется) и пропсам со строгим равенством (===) позволяет пропускать re-render, когда
 * набор данных и фильтры не изменились (observer всё равно отреагирует на изменения внутри моделей).
 *
 * Объединяет React.memo и observer: компонент реагирует на изменения MobX-observables,
 * при этом re-render от родителя пропускается, если компаратор считает пропсы равными.
 *
 * @param Component - React-компонент для мемоизации
 * @param comparatorOrConfig - Режим сравнения:
 *   - **Функция**: полный контроль над сравнением (prevProps, nextProps) => boolean
 *   - **Конфиг** { arrays?: ['key1'], strictEqual?: ['filter'] }: сравнивается состав массивов
 *     (как множество элементов, порядок не важен) и пропсы по строгому равенству (===).
 *     Изменение filter при неизменном составе items вызовет re-render.
 *     При пустом конфиге для конкретной группы пропсов будет использовано прямое сравнение пропсов для всей группы:
 *     - массивы — для ключей, где значение является массивом
 *     - strictEqual — для остальных ключей (сравнение через ===)
 *
 * @returns Мемоизированный компонент с опциональным полем compare (для тестов)
 *
 * @example
 * // ParticipantsListGrouped: participants из MST-модели или view
 * memoizeProps(ParticipantsListGrouped, { arrays: ['participants'], strictEqual: ['filter'] })
 *
 * @example
 * // Кастомный comparator
 * memoizeProps(Component, (prev, next) => prev.id === next.id)
 */
const memoizeProps = <TProps extends Record<string, unknown>>(
  Component: ComponentType<TProps>,
  comparatorOrConfig: TMemoPredicate<TProps> | TMemoizedPropsConfig<TProps>,
): TMemoizedComponent<TProps> => {
  if (typeof comparatorOrConfig === 'function') {
    return memo(observer(Component), comparatorOrConfig);
  }

  const comparator = createComparatorFromConfig(comparatorOrConfig);

  return memo(observer(Component), comparator);
};

export default memoizeProps;
