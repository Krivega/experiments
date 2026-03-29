import { resolveSetter } from '@experiments/mst-tools';
import { types } from 'mobx-state-tree';

import type { TInstanceModel } from '@experiments/mst-tools';

const TIMER_NOT_STARTED = 0 as const;
const TIMER_TICK_INTERVAL_MS = 1000 as const;

/**
 * Модель таймера на mobx-state-tree.
 * Хранит текущее время и момент запуска для расчёта прошедшего времени или обратного отсчёта.
 */
const ModelTimer = types
  .model('Timer', {
    /** Текущее время в миллисекундах, обновляется каждую секунду при запущенном таймере. */
    timestamp: types.optional(types.number, 0),
    /** Момент запуска таймера в миллисекундах. TIMER_NOT_STARTED — таймер не запущен. Сбрасывается в TIMER_NOT_STARTED в stopTimer(). */
    startedAt: types.optional(types.number, TIMER_NOT_STARTED),
  })
  .views((self) => {
    return {
      get isNotStarted(): boolean {
        return self.startedAt === TIMER_NOT_STARTED;
      },
    };
  })
  .views((self) => {
    return {
      /** Количество миллисекунд, прошедших с момента запуска. 0, если таймер не запущен или был остановлен. */
      get elapsedMs(): number {
        if (self.isNotStarted) {
          return 0;
        }

        return self.timestamp - self.startedAt;
      },
    };
  })
  .actions((self) => {
    const resolveSelfSetter = resolveSetter(self);
    const setTimestamp = resolveSelfSetter('timestamp');
    const setStartedAt = resolveSelfSetter('startedAt');

    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

    /**
     * Останавливает таймер и сбрасывает startedAt,
     * если таймер был запущен.
     */
    const stopTimer = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
        setStartedAt(TIMER_NOT_STARTED);
      }
    };

    /** Обновляет timestamp и планирует следующий запуск. */
    const nextTick = () => {
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      self.setTimestamp(Date.now()); // Установить текущее время.
      timeoutId = setTimeout(nextTick, TIMER_TICK_INTERVAL_MS); // Запланировать следующий тик.
    };

    /** Инициализирует работу таймера */
    const startTicking = () => {
      const now = Date.now();

      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      self.setTimestamp(now);
      setStartedAt(now);

      timeoutId = setTimeout(nextTick, TIMER_TICK_INTERVAL_MS);
    };

    /**
     * Запускает таймер.
     * Запоминает момент старта и запускает первый тик, если таймер ещё не запущен.
     */
    const startTimer = () => {
      if (timeoutId) {
        return;
      }

      startTicking();
    };

    /**
     * Функция жизненного цикла вызывается перед уничтожением модели.
     * Останавливает таймер, чтобы избежать утечек ресурсов.
     */
    const beforeDestroy = () => {
      stopTimer();
    };

    return {
      setTimestamp,
      stopTimer,
      startTimer,
      beforeDestroy,
    };
  });

export type TTimerStore = TInstanceModel<typeof ModelTimer>;

export default ModelTimer;
