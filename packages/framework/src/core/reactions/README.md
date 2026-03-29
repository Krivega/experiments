# Framework Utilities

## createAutoSyncModel

Утилита для создания MobX-State-Tree моделей с автоматической синхронизацией и **типизированными** базовыми методами для работы с полями.

### Базовое использование

```ts
import { createAutoSyncModel } from '@/shared/framework';
import { FieldsModel } from './Fields';

const Model = createAutoSyncModel(FieldsModel);

// Модель автоматически получает базовые методы с ПРАВИЛЬНЫМИ ТИПАМИ:
// - fill(data: { cameras: TCamera[]; isEnabled: boolean }) - типизированное заполнение полей
// - rememberState() - сохранение состояния
// - resetToRememberState() - сброс к сохраненному состоянию
```

### 🎯 Правильная типизация из коробки

Главное преимущество - **методы автоматически получают правильные типы из FieldsModel**:

```ts
const instance = Model.create({});

// ✅ Правильный тип - TypeScript понимает структуру данных
instance.fill({
  cameras: [{ id: '1', label: 'Camera 1', isActive: true }],
  isEnabled: true,
});

// ❌ Ошибки типизации - TypeScript предупредит об ошибках
// instance.fill('wrong type'); // Error: string не подходит
// instance.fill({ wrongProperty: true }); // Error: неправильная структура
```

### Автоматически добавляемые методы

При создании модели через `createAutoSyncModel`, она автоматически получает следующие **типизированные** методы:

#### `fill(data: ConcreteType)`

Прокси-метод для заполнения полей. **Тип параметра автоматически извлекается из FieldsModel**.

Например, если в FieldsModel есть:

```ts
// В FieldsModel
const fill = (state: { cameras: TCamera[]; isEnabled: boolean }) => { ... }
```

То в созданной модели `fill` будет иметь точно такой же тип!

#### `rememberState()`

Прокси-метод для сохранения текущего состояния полей.

#### `resetToRememberState()`

Прокси-метод для сброса полей к сохраненному состоянию.

### Использование с дополнительными views и actions

```ts
import { createAutoSyncModel } from '@/shared/framework';
import { FieldsModel, type TInstanceFields } from './Fields';

const Model = createAutoSyncModel(FieldsModel)
  .views((self) => {
    const fields = self.fields as TInstanceFields;

    return {
      // Дополнительные геттеры
      get changedState() {
        return fields.changedState;
      },
      get cameras() {
        return fields.cameras;
      },
    };
  })
  .actions((self) => {
    const fields = self.fields as TInstanceFields;

    return {
      // Дополнительные методы с использованием типизированных базовых
      customReset: () => {
        self.resetToRememberState(); // Используем базовый метод
        // дополнительная логика
      },

      // Типизированная обработка данных
      safeFill: (cameras: { id: string; label: string; isActive: boolean }[]) => {
        self.fill({
          // TypeScript проверит правильность типов!
          cameras,
          isEnabled: true,
        });
        self.rememberState();
      },
    };
  });
```

### Сравнение типизации

#### ❌ До - неточные типы

```ts
// Методы имели тип any или unknown
const fill = (data: unknown) => { ... }; // Нет проверки типов
```

#### ✅ После - точные типы из FieldsModel

```ts
// Методы автоматически получают правильные типы
const fill = (data: { cameras: TCamera[]; isEnabled: boolean }) => { ... }; // Полная типизация!
```

### Результат

- ✅ **Автоматическая типизация** - типы извлекаются из FieldsModel автоматически
- ✅ **Compile-time проверки** - ошибки типов обнаруживаются при разработке
- ✅ **IntelliSense поддержка** - автодополнение знает точную структуру данных
- ✅ **Refactoring safety** - изменения в FieldsModel автоматически обновляют типы
- ✅ **Меньше boilerplate** - не нужно дублировать типы методов вручную

## createFormSyncModel

Утилита для создания MobX-State-Tree моделей **форм** с автоматической синхронизацией и **типизированными** базовыми методами для работы с полями. Специализированная версия для форм с интеграцией `FormStatusSync` и `ModelSyncForm`.

### Базовое использование

```ts
import { createFormSyncModel } from '@/shared/framework';
import { NatSettingsFieldsModel } from './Fields';

const Model = createFormSyncModel(NatSettingsFieldsModel);

// Модель автоматически получает базовые методы с ПРАВИЛЬНЫМИ ТИПАМИ:
// - fill(data: ConcreteType) - типизированное заполнение полей
// - rememberState() - сохранение состояния полей
// - resetToRememberState() - сброс к сохраненному состоянию полей
// + методы для управления состоянием формы (валидация, сохранение, etc.)
```

### 🎯 Интеграция с FormStatusSync и ModelSyncForm

Главное отличие от `createAutoSyncModel` - **автоматическая интеграция с системой управления формами**:

```ts
const instance = Model.create({});

// ✅ Методы работы с полями
instance.fill({ natField: '192.168.1.1', isEnabled: true });
instance.rememberState();
instance.resetToRememberState();

// ✅ Методы управления состоянием формы (от ModelSyncForm)
instance.setSyncInProgress();
instance.setSynced();
instance.setSaveInProgress();
instance.setSaveError();
// и другие методы состояния формы...

// ✅ Метод получения текущих полей
const currentFields = instance.getCurrentFields();
```

### Автоматически добавляемые методы

#### Базовые методы полей

- **`fill(data: ConcreteType)`** - заполнение полей с типизацией из FieldsModel
- **`rememberState()`** - сохранение текущего состояния полей
- **`resetToRememberState()`** - сброс к сохраненному состоянию

#### Методы управления состоянием формы

Автоматически наследуются от `ModelSyncForm`:

- `setSyncInProgress()`, `setSynced()`, `setSyncError()`
- `setSaveInProgress()`, `setSaved()`, `setSaveError()`
- `setNotSaved()`, `setNotValid()`, `cancelChanges()`

#### Дополнительные методы

- **`getCurrentFields()`** - получение текущего состояния полей через `fields.currentState`

### Lifecycle и автоматическая синхронизация

```ts
const Model = createFormSyncModel(NatSettingsFieldsModel);
const instance = Model.create({});

// ✅ Автоматически настраивается FormStatusSync
// afterCreate() - подписка на реакции формы
// beforeDestroy() - отписка от реакций

// FormStatusSync автоматически обрабатывает:
// - Переходы состояний при изменении полей
// - Валидацию через fields.hasValid()
// - Синхронизацию состояния формы
```

### Использование в реальной форме

```ts
// В Model.ts
import { createFormSyncModel } from '@/shared/framework';
import type { TInstanceModel } from '@experiments/mst-tools';
import { NatSettingsFieldsModel } from './Fields';

const Model = createFormSyncModel(NatSettingsFieldsModel);

export type TInstance = TInstanceModel<typeof Model>;
export default Model;
```

## withRememberState

Утилита для добавления функциональности **запоминания состояния** к любым MobX-State-Tree моделям. Позволяет извлечь общую логику работы с `rememberedState` и `isFilledRecently` в переиспользуемый компонент.

### Базовое использование

```ts
import { withRememberState } from '@/shared/framework';
import { types as typesMST } from 'mobx-state-tree';

// Создаем базовую модель
const BaseModel = typesMST
  .model({
    name: typesMST.string,
    age: typesMST.number,
  })
  .views((self) => ({
    get currentState() {
      return {
        name: self.name,
        age: self.age,
      };
    },
  }));

// Добавляем функциональность запоминания состояния
const Model = withRememberState(BaseModel).actions((self) => {
  const selfWithRemember = self as typeof self & {
    setIsFilledRecently: (value: boolean) => void;
    rememberState: () => void;
    rememberedState?: { name: string; age: number };
  };

  const setCurrentState = (state: { name: string; age: number }) => {
    Object.assign(self, state);
  };

  return {
    fill: (state: { name: string; age: number }) => {
      setCurrentState(state);
      selfWithRemember.setIsFilledRecently(true);
      selfWithRemember.rememberState();
    },
    resetToRememberState: () => {
      const { rememberedState } = selfWithRemember;
      if (rememberedState === undefined) return;
      setCurrentState(rememberedState);
      selfWithRemember.setIsFilledRecently(false);
    },
  };
});
```

### 🎯 Автоматически добавляемая функциональность

При использовании `withRememberState`, модель автоматически получает:

#### Volatile поля

- **`rememberedState?: TState`** - сохраненное состояние модели
- **`isFilledRecently: boolean`** - флаг недавнего заполнения

#### Views

- **`isFilledAndRemembered`** - проверяет, что модель заполнена и состояние сохранено
- **`hasEqualState()`** - сравнивает текущее состояние с сохраненным

#### Actions

- **`rememberState()`** - сохраняет текущее состояние модели в `rememberedState`
- **`setIsFilledRecently(value: boolean)`** - устанавливает флаг недавнего заполнения

### Требования к базовой модели

Базовая модель должна иметь view `currentState`, который возвращает объект с текущим состоянием:

```ts
const BaseModel = typesMST
  .model({
    // ваши поля
  })
  .views((self) => ({
    get currentState() {
      return {
        // текущее состояние полей
      };
    },
  }));
```

### Использование в реальных моделях

```ts
// До - много boilerplate
const Model = typesMST
  .model({
    name: typesMST.string,
    age: typesMST.number,
  })
  .volatile(() => ({
    rememberedState: undefined as TState | undefined,
    isFilledRecently: false,
  }))
  .views((self) => ({
    get currentState() {
      /* ... */
    },
    get isFilledAndRemembered() {
      /* ... */
    },
    hasEqualState() {
      /* ... */
    },
  }))
  .actions((self) => {
    const resolveSelfSetter = resolveSetter(self);
    // ... много кода для работы с состоянием
  });

// После - использование withRememberState
const BaseModel = typesMST
  .model({
    name: typesMST.string,
    age: typesMST.number,
  })
  .views((self) => ({
    get currentState() {
      return { name: self.name, age: self.age };
    },
  }));

const Model = withRememberState(BaseModel).actions((self) => {
  // только специфичная логика модели
});
```

### Интеграция с формами

`withRememberState` отлично работает с существующими формами:

```ts
// В Fields/Model.ts
const BaseFieldsModel = typesMST
  .model({
    // поля формы
  })
  .views((self) => ({
    get currentState() {
      // возвращает состояние полей
    },
  }));

const FieldsModel = withRememberState(BaseFieldsModel).actions((self) => {
  return {
    fill: (state) => {
      // устанавливаем состояние
      self.setIsFilledRecently(true);
      self.rememberState();
    },
    resetToRememberState: () => {
      // сбрасываем к сохраненному состоянию
      self.setIsFilledRecently(false);
    },
  };
});
```

### Сравнение с createAutoSyncModel и createFormSyncModel

| **Критерий**              | **withRememberState**                 | **createAutoSyncModel**               | **createFormSyncModel**                 |
| ------------------------- | ------------------------------------- | ------------------------------------- | --------------------------------------- |
| **Целевое назначение**    | Добавление логики запоминания         | Общие модели с синхронизацией         | Специально для форм                     |
| **Входная модель**        | Любая MST модель                      | FieldsModel                           | FieldsModel                             |
| **Добавляемые поля**      | `rememberedState`, `isFilledRecently` | `fields` + всё от `withRememberState` | `fields` + всё от `withRememberState`   |
| **Интеграция состояния**  | -                                     | `ModelSyncAuto` + `StatusAutoSync`    | `ModelSyncForm` + `FormStatusSync`      |
| **Автоматические методы** | Только запоминание состояния          | Запоминание + синхронизация           | Запоминание + синхронизация + валидация |
| **Гибкость**              | Максимальная                          | Высокая                               | Средняя (заточена под формы)            |

### Результат

- ✅ **Переиспользуемость** - одна утилита для всех моделей, где нужно запоминание состояния
- ✅ **Типобезопасность** - автоматическое извлечение типов из `currentState`
- ✅ **Минимальный boilerplate** - устраняет дублирование кода
- ✅ **Композируемость** - можно комбинировать с другими утилитами
- ✅ **Гибкость** - подходит для любых MST моделей с `currentState`

### Сравнение с createAutoSyncModel и createFormSyncModel

| **Критерий**               | **createAutoSyncModel**                 | **createFormSyncModel**                 | **withRememberState**                    |
| -------------------------- | --------------------------------------- | --------------------------------------- | ---------------------------------------- |
| **Целевое назначение**     | Общие модели с синхронизацией           | Специально для форм                     | Добавление логики запоминания            |
| **Базовые методы**         | `rememberState`, `resetToRememberState` | `rememberState`, `resetToRememberState` | `rememberState`, `setIsFilledRecently`   |
| **Интеграция состояния**   | `ModelSyncAuto` + `StatusAutoSync`      | `ModelSyncForm` + `FormStatusSync`      | -                                        |
| **Методы состояния**       | Синхронизация и сохранение              | Синхронизация, сохранение + валидация   | Только запоминание состояния             |
| **Дополнительные методы**  | -                                       | `getCurrentFields()`                    | `isFilledAndRemembered`, `hasEqualState` |
| **Автоматические реакции** | Базовые                                 | Расширенные для форм (валидация, etc.)  | -                                        |
| **Гибкость**               | Высокая                                 | Средняя (заточена под формы)            | Максимальная                             |

### Результат

- ✅ **Всё от createAutoSyncModel** - типизация, проксирование, lifecycle
- ✅ **Специализация для форм** - `FormStatusSync`, `ModelSyncForm`
- ✅ **Расширенные состояния** - валидация, расширенные переходы состояний
- ✅ **Упрощение архитектуры** - одна строка вместо 15-20 строк boilerplate
- ✅ **Готовность к использованию** - полная интеграция с системой форм
- ✅ **Переиспользуемость** - `withRememberState` может использоваться в любых моделях

## Тестирование

Все утилиты полностью покрыты тестами.

### withRememberState

Утилита покрыта тестами, которые проверяют:

#### ✅ Базовая функциональность

- Создание модели с добавленными volatile полями (`rememberedState`, `isFilledRecently`)
- Добавление базовых методов (`rememberState`, `setIsFilledRecently`)
- Добавление views (`isFilledAndRemembered`, `hasEqualState`)

#### ✅ Работа с состоянием

- Корректное сохранение состояния через `rememberState`
- Управление флагом через `setIsFilledRecently`
- Логика работы `isFilledAndRemembered`
- Сравнение состояний через `hasEqualState`

#### ✅ Интеграционные сценарии

- Полный цикл: заполнение → запоминание → изменение → проверка
- Несколько циклов изменений и запоминания
- Корректность восстановления и сравнения состояний

#### ✅ Возможность расширения

- Добавление дополнительных `actions` с использованием базовых методов
- Добавление дополнительных `views` с доступом к `rememberedState`
- Композиция с другими MST утилитами

#### ✅ Типизация

- Автоматическое извлечение типов из `currentState`
- Безопасная работа с типизированными данными
- Сохранение типов при расширении модели

#### Запуск тестов

```bash
npx jest src/shared/framework/__tests__/withRememberState.test.ts
```

Результат: **11 тестов прошли успешно** ✅

### createAutoSyncModel

Утилита покрыта тестами, которые проверяют:

#### ✅ Базовая функциональность

- Создание модели с полем `fields`
- Добавление базовых методов (`fill`, `rememberState`, `resetToRememberState`)
- Добавление lifecycle методов (`afterCreate`, `beforeDestroy`)

#### ✅ Работа прокси-методов

- Корректное проксирование вызовов к методам `fields`
- Передача параметров без изменений
- Сохранение поведения оригинальных методов

#### ✅ Интеграционные сценарии

- Полный цикл: заполнение → запоминание → изменение → сброс
- Обработка нескольких циклов `remember`/`reset`
- Корректность сохранения и восстановления состояния

#### ✅ Возможность расширения

- Добавление дополнительных `views`
- Добавление дополнительных `actions`
- Использование базовых методов в расширенных функциях

#### ✅ Типизация

- Передача правильной структуры данных в методы `fields`
- Сохранение типов при проксировании

#### Запуск тестов

```bash
npx jest src/shared/framework/__tests__/createAutoSyncModel.test.ts
```

Результат: **12 тестов прошли успешно** ✅

### createFormSyncModel

Утилита покрыта тестами, которые проверяют:

#### ✅ Базовое создание модели формы

- Создание модели с полем `fields`
- Добавление базовых методов работы с полями (`fill`, `rememberState`, `resetToRememberState`)
- Добавление методов lifecycle (`afterCreate`, `beforeDestroy`)
- Добавление методов управления состоянием формы от `ModelSyncForm`

#### ✅ Работа прокси-методов формы

- Проксирование `fill` → `fields.fill`
- Проксирование `rememberState` → `fields.rememberState`
- Проксирование `resetToRememberState` → `fields.resetToRememberState`

#### ✅ Интеграционные сценарии форм

- Полный цикл: fill → remember → change → reset
- Обработка нескольких циклов изменений
- Работа с валидацией и состояниями формы

#### ✅ Возможность расширения формы

- Добавление дополнительных `views` специфичных для форм
- Добавление дополнительных `actions` с использованием базовых методов форм

#### ✅ Метод getCurrentFields

- Возврат текущего состояния полей через `fields.currentState`
- Обновление состояния после изменений

#### ✅ Lifecycle методы формы

- Корректное создание и уничтожение с `FormStatusSync`

#### ✅ Сохранение типизации формы

- Передача правильной структуры данных в методы полей
- Сохранение типов при работе с состоянием полей формы

#### Запуск тестов

```bash
npx jest src/shared/framework/__tests__/createFormSyncModel.test.ts
```

Результат: **16 тестов прошли успешно** ✅

### BaseSaveForm

Утилита покрыта тестами, которые проверяют:

#### ✅ Базовая функциональность

- Создание экземпляра с переданными зависимостями (`instance`, `serverApi`, `coreApi`)
- Инициализация debug logger'а
- Правильное сохранение ссылок на зависимости

#### ✅ Метод save()

**Успешный сценарий:**

- Вызов `handleStart()` с правильными эффектами (скрытие уведомлений, установка состояния)
- Получение данных через `getSaveData()` из `instance.fields.currentState`
- Вызов серверного API с полученными данными
- Возврат функции отмены
- Вызов `handleSuccess()` при успешном сохранении

**Сценарий с ошибкой:**

- Вызов `handleError()` при ошибке сохранения
- Корректная обработка отмененных запросов (проверка `hasAbortedError`)
- Логирование ошибок и установка соответствующего состояния

#### ✅ Метод saveAction()

- Возврат объекта с функцией `abort`
- Запуск процесса сохранения через метод `save()`

#### ✅ Защищенные методы

**getSaveData():**

- Возврат данных из `instance.fields.currentState`
- Работа с различными типами данных

**callServerApi():**

- Вызов унифицированного `serverApi.setData()` с переданными данными
- Возврат результата API-вызова

**handleStart():**

- Скрытие всех уведомлений
- Установка состояния "сохранение в процессе"

**handleSuccess():**

- Показ уведомления об успешном сохранении
- Сохранение состояния формы (`rememberState`)

**handleError():**

- Логирование ошибок
- Условное отображение уведомлений (зависит от `hasAbortedError`)
- Установка состояния ошибки
- Обработка различных типов ошибок

#### ✅ Интеграционные тесты

- Полный цикл успешного сохранения
- Полный цикл сохранения с ошибкой
- Множественные вызовы `save()`
- Работа с `saveAction()`

#### ✅ Типизация

- Корректная работа с типизированными данными
- Поддержка различных generic типов (`TData`, `TInstance`, `TServerApi`, `TCoreApi`)
- Создание наследников с кастомными типами

#### ✅ Граничные случаи

- Обработка пустых данных в `currentState`
- Обработка `undefined` в `currentState`
- Случай, когда `abort` функция не определена
- Идемпотентность методов при повторных вызовах

#### Запуск тестов

```bash
npx jest src/shared/framework/__tests__/BaseSaveForm.test.ts
```

Результат: **34 теста прошли успешно** ✅

# BaseSyncForm

Базовый класс для синхронизации форм с сервером с поддержкой **real-time обновлений** через WebSocket или другие источники данных. Создан для устранения дублирования кода в функциях синхронизации форм.

## Архитектура

Класс инкапсулирует общую логику:

- Управление состоянием синхронизации формы
- Обработка процесса загрузки данных с промисами и отменой
- Единообразная обработка ошибок
- Логирование
- Подписка на real-time обновления - автоматическая синхронизация с WebSocket/SSE
- Блокировка обновлений во время сохранения

## Интерфейсы

### ISyncFormInstance

```typescript
export interface ISyncFormInstance<TData extends { state: unknown; dependentData?: unknown }> {
  setSyncInProgress: () => void;
  setSyncError: () => void;
  isSaveInProgress: boolean;
  fill: (state: TData['state'], dependentData?: TData['dependentData']) => void;
}
```

### IServerApi

```typescript
export interface IServerApi<TData = unknown> {
  getData: () => { promise: Promise<TData>; abort: () => void };
}
```

### IOptions

```typescript
export interface IOptions<TData = unknown> {
  subscribeData?: (callback: (event: TData) => void) => () => void;
}
```

## Использование

### 1. Базовая синхронизация (без подписки)

```typescript
class UserSyncForm extends BaseSyncForm<TUserData, TInstance, TDependencies> {}

const syncForm = new UserSyncForm({
  instance,
  dependencies: { serverApi, coreApi },
  executableActions: {},
  actions: {},
});

// Запуск синхронизации
syncForm.start();

// Остановка синхронизации
syncForm.stop();
```

### 2. Синхронизация с real-time обновлениями

```typescript
class UserSyncForm extends BaseSyncForm<TUserData, TInstance, TDependencies> {}

const syncForm = new UserSyncForm(
  {
    instance,
    dependencies: { serverApi, coreApi },
    executableActions: {},
    actions: {},
  },
  {
    subscribeData: coreApi.subscribeToUserUpdates, // Опция для подписки
  },
);

syncForm.start(); // Загрузит начальные данные и подпишется на обновления
```

## Методы

### Публичные методы

- `start(): void` - запуск синхронизации (загрузка начальных данных + подписка)
- `stop(): void` - остановка синхронизации (отписка + отмена запросов)

### Защищенные методы (можно переопределить)

- `handleSuccess(data: TData): void` - обработка успешной синхронизации
- `handleError(error: unknown): void` - обработка ошибки синхронизации
- `writeFunction(data: TData): void` - запись данных в форму
- `hasAvailableWriteFromSocket(): boolean` - проверка доступности записи из подписки
- `writeFromSocket(data: TData): void` - запись данных из подписки с проверкой

## Жизненный цикл с подпиской

1. **Запуск** (`start()`)
   - Отписка от предыдущих обновлений (если есть)
   - Установка состояния `setSyncInProgress()`
   - Запрос начальных данных через `serverApi.getData()`

2. **Успешная загрузка** (`handleSuccess()`)
   - Запись данных через `writeFunction()`
   - Подписка на обновления через `subscribeData()`
   - Сохранение функции отписки

3. **Real-time обновления**
   - Получение данных из подписки
   - Проверка `hasAvailableWriteFromSocket()` - блокировка во время сохранения
   - Запись данных через `writeFromSocket()` (если разрешено)

4. **Остановка** (`stop()`)
   - Вызов функции отписки
   - Отмена текущих запросов
   - Очистка ресурсов

## Умная блокировка обновлений

Обновления из подписки **автоматически блокируются** во время сохранения формы:

```typescript
// В вашей форме
instance.setSaveInProgress(); // Начало сохранения

// ❌ Обновления из WebSocket игнорируются
// writeFromSocket() проверяет isSaveInProgress

instance.setSaved(); // Сохранение завершено

// ✅ Обновления из WebSocket снова обрабатываются
```

Это предотвращает конфликты между данными, которые пользователь сохраняет, и обновлениями с сервера.

# BaseSaveForm

Базовый класс для инкапсуляции общей логики сохранения форм. Создан по аналогии с `BaseSyncForm` для устранения дублирования кода в функциях `resolveSaveForm`.

## Архитектура

Класс инкапсулирует общую логику:

- Управление уведомлениями и состоянием формы
- Обработка процесса сохранения с промисами и отменой
- Единообразная обработка ошибок
- Логирование
- **Унифицированный API** - все формы используют единый метод `setData()`
- **Автоматическая обработка данных** - извлечение данных из `instance.fields.currentState`

## Интерфейсы

### ISaveFormInstance

```typescript
export interface ISaveFormInstance {
  setSaveInProgress: () => void;
  setSaveError: () => void;
  rememberState: () => void;
  fields: {
    currentState: unknown;
  };
}
```

### ICoreApiSave

```typescript
export interface ICoreApiSave {
  hideAllNotifications: () => void;
  showSuccessSavingForm: () => void;
  showFailedToSaveFormError: () => void;
}
```

### IServerApiSave

```typescript
export interface IServerApiSave<TData = unknown> {
  hasAbortedError: (error: unknown) => boolean;
  setData: (data: TData) => { promise: Promise<void>; abort: () => void };
}
```

## Использование

### 1. Минимальное создание формы

```typescript
// Больше НЕ нужно переопределять getSaveData!
class ViscaSaveForm extends BaseSaveForm<TDataToSave, void, TInstance, TServerApi, TCoreApi> {}

class NatSaveForm extends BaseSaveForm<TDataToSave, void, TInstance, IServerApi, ICoreApi> {}
```

### 2. Использование в resolveSaveForm

```typescript
const resolveSaveForm = (dependencies: TDependencies) => {
  return (instance: TInstance) => {
    return (): TAbortableAction => {
      const saveForm = new ViscaSaveForm({
        instance,
        dependencies,
        debugNamespace: 'resolveSaveForm',
      });

      return saveForm.createSaveAction()();
    };
  };
};
```

### 3. Кастомизация при необходимости

```typescript
// Если нужна специальная логика получения данных
class CustomSaveForm extends BaseSaveForm<TCustomData, void, TInstance, TServerApi, TCoreApi> {
  protected getSaveData(): TCustomData {
    // Кастомная логика обработки данных
    const baseData = this.instance.fields.currentState;
    return {
      ...baseData,
      timestamp: Date.now(),
      version: '1.0',
    };
  }
}
```

## Методы

### Публичные методы

- `save(): () => void` - основной метод сохранения, возвращает функцию отмены
- `saveAction(): { abort: () => void }` - обертка для совместимости с существующим API

### Защищенные методы (можно переопределить)

- `handleStart(): void` - обработка начала сохранения
- `handleSuccess(): void` - обработка успешного сохранения
- `handleError(error: unknown): void` - обработка ошибки сохранения
- `callServerApi(data: TData): { promise: Promise<void>; abort: () => void }` - вызов унифицированного API `setData()`
- `getSaveData(): TData` - получение данных из `this.instance.fields.currentState`

## Эволюция архитектуры

### ✅ Что изменилось

**Этап 1 - Создание BaseSaveForm:**

```typescript
// Было дублирование в каждой форме
const handleStart = (instance, dependencies) => {
  /* 10 строк */
};
const handleSuccess = (instance, dependencies) => {
  /* 5 строк */
};
const handleError = (error, instance, dependencies) => {
  /* 10 строк */
};
```

**Этап 2 - Унификация API:**

```typescript
// Было: разные методы для каждой формы
serverApi.setViscaSettings(data); // ViscaSettings
serverApi.setData(data); // NatSettings

// Стало: единый API
serverApi.setData(data); // Все формы
```

**Этап 3 - Автоматизация getSaveData:**

```typescript
// Было: переопределение в каждой форме
class ViscaSaveForm extends BaseSaveForm {
  protected getSaveData(): TData {
    return this.instance.fields.currentState;
  }
}

// Стало: пустые классы
class ViscaSaveForm extends BaseSaveForm<TDataToSave, void, TInstance, TServerApi, TCoreApi> {}
```

## Преимущества

1. **Максимальное устранение дублирования** - вся логика в базовом классе
2. **Типобезопасность** - строгая типизация через generic'и
3. **Простота использования** - пустые классы-наследники
4. **Расширяемость** - возможность переопределения любых методов
5. **Совместимость** - поддержка существующего API
6. **Единообразие** - следует паттерну `BaseSyncForm`
7. **Унифицированный API** - все формы используют `setData()`
8. **Zero config** - работает без настройки для стандартных случаев
