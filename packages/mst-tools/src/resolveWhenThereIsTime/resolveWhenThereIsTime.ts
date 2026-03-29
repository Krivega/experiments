import { CancelableRequest } from '@krivega/cancelable-promise';
import { when } from 'mobx';

type TWhenThereIsTime = {
  dispose: () => void;
  when: () => Promise<void>;
};

const resolveWhenThereIsTime = (predicate: () => boolean, timeout: number): TWhenThereIsTime => {
  let disposerWhen = () => {};
  let dispose: () => void;
  let timeoutId: NodeJS.Timeout;

  const whenThereIsTime = async (): Promise<void> => {
    dispose();

    return new Promise<void>((resolve, reject) => {
      disposerWhen = when(predicate, () => {
        resolve();
        clearTimeout(timeoutId);
      });

      timeoutId = setTimeout(() => {
        disposerWhen();
        reject(new Error('Time is ended'));
      }, timeout);
    });
  };

  const cancelableWhen = new CancelableRequest<void, void>(whenThereIsTime);

  dispose = () => {
    clearTimeout(timeoutId);
    disposerWhen();
    cancelableWhen.cancelRequest();
  };

  return {
    dispose,
    when: async () => {
      return cancelableWhen.request();
    },
  };
};

export default resolveWhenThereIsTime;
