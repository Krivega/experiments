/// <reference types="jest" />
import { MediaStreamMock } from 'webrtc-mock';

import { createCanvas, getCanvasMediaStream } from '..';

describe('getCanvasMediaStream', () => {
  const width = 800;
  const height = 600;

  it('#1 should be created media stream', () => {
    const mediaStreamMock = new MediaStreamMock() as unknown as MediaStream;
    const canvas = createCanvas(width, height);

    canvas.captureStream = () => {
      return mediaStreamMock;
    };

    const mediaStream = getCanvasMediaStream(canvas);

    expect(mediaStream).toBe(mediaStreamMock);
  });
});
