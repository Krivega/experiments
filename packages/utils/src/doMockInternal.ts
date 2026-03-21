/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import 'jest-canvas-mock';
import { getCanvasMediaStreamMock } from 'webrtc-mock';

const doMockInternal = () => {
  const { getContext: getContextOriginal } = HTMLCanvasElement.prototype;

  function getContext(
    ...arguments_: Parameters<typeof getContextOriginal>
  ): ReturnType<typeof getContextOriginal> {
    let context = {} as RenderingContext;

    if (getContextOriginal) {
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-invalid-this
      context = getContextOriginal.apply(this as unknown as HTMLCanvasElement, arguments_) ?? {};
    }

    // @ts-expect-error
    context.drawImage = () => {};

    return context;
  }

  // @ts-expect-error
  HTMLCanvasElement.prototype.getContext = getContext;
  // @ts-expect-error
  HTMLCanvasElement.prototype.captureStream = async () => {
    return getCanvasMediaStreamMock();
  };
};

export default doMockInternal;
