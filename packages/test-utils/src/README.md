# BaseMockServerApi

`BaseMockServerApi` — базовый класс для mock server api в тестах.

Он дает:

- унифицированный `request` с `promise` и `abort`;
- переключение режимов ошибок (`failed` и `aborted`);
- типизированные события через `onEvent` и `emitEvent`.

## Важно

Чтобы эмитить и слушать события, нужно:

- передать `TEventMap` в generic класса;
- передать массив имен событий во второй аргумент `super(...)`.

Без массива имен `emitEvent`/`onEvent` не будут иметь зарегистрированных событий.

## Пример использования

```ts
import { BaseMockServerApi } from '@experiments/test-utils';

type TEventMap = {
  changeUsers: { ids: string[] };
  changeStatus: { isLoading: boolean };
};

class MockServerApi extends BaseMockServerApi<TEventMap> {
  public constructor() {
    super({ isFailAllRequests: false, isAbortedError: false }, ['changeUsers', 'changeStatus']);
  }

  public getData = () => {
    return this.request({ state: { users: [] } });
  };

  public onChangeUsers = (callback: (params: { ids: string[] }) => void) => {
    return this.onEvent('changeUsers', callback);
  };

  public triggerUsersChange = (ids: string[]) => {
    this.emitEvent('changeUsers', { ids });
  };
}
```

## Управление ошибками запроса

- `setFailAllRequests()` — все `request` будут отклоняться с ошибкой `'failed'`;
- `setAbortAllRequests()` — все `request` будут отклоняться с ошибкой `'aborted'`;
- `reset()` — сброс обоих флагов;
- `hasAbortedError()` — проверить флаг abort-ошибки.

## Контракт request

`request(data)` возвращает:

```ts
{
  promise: Promise<TData>;
  abort: () => void;
}
```

Это удобно для тестов, где интерфейс API ожидает cancelable-подобный контракт.
