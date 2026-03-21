import prepareConstraints from '../prepareConstraints';

describe('prepareConstraints', () => {
  describe('Базовое поведение', () => {
    it('должен вернуть audio: false и video: true при отсутствии параметров', () => {
      const result = prepareConstraints({});

      expect(result).toEqual({
        audio: false,
        video: true,
      });
    });

    it('должен вернуть audio: false при отсутствии audioDeviceId', () => {
      const result = prepareConstraints({ audio: true });

      expect(result.audio).toBe(false);
    });

    it('должен вернуть video: false при передаче video: false', () => {
      const result = prepareConstraints({ video: false });

      expect(result.video).toBe(false);
    });

    it('должен вернуть video: true при отсутствии video constraints', () => {
      const result = prepareConstraints({ audio: false, video: true });

      expect(result.video).toBe(true);
    });
  });

  describe('Audio constraints', () => {
    const audioDeviceId = 'audio-device-123';

    it('должен создать audio constraints с exact deviceId при наличии audioDeviceId', () => {
      const result = prepareConstraints({ audioDeviceId });

      expect(result.audio).toEqual({
        deviceId: { exact: audioDeviceId },
        echoCancellation: undefined,
        sampleRate: undefined,
      });
    });

    it('должен добавить echoCancellation в audio constraints при его передаче', () => {
      const result = prepareConstraints({
        audioDeviceId,
        echoCancellation: true,
      });

      expect(result.audio).toEqual({
        deviceId: { exact: audioDeviceId },
        echoCancellation: true,
      });
    });

    it('должен добавить sampleRate в audio constraints при его передаче', () => {
      const result = prepareConstraints({
        audioDeviceId,
        sampleRate: 44_100,
      });

      expect(result.audio).toEqual({
        deviceId: { exact: audioDeviceId },
        echoCancellation: undefined,
        sampleRate: 44_100,
      });
    });

    it('должен вернуть audio: false при передаче audio: false даже с audioDeviceId', () => {
      const result = prepareConstraints({
        audio: false,
        audioDeviceId,
      });

      expect(result.audio).toBe(false);
    });
  });

  describe('Video constraints - deviceId', () => {
    const videoDeviceId = 'video-device-456';

    it('должен добавить exact deviceId в video constraints при наличии videoDeviceId', () => {
      const result = prepareConstraints({ videoDeviceId });

      expect(result.video).toEqual({
        deviceId: { exact: videoDeviceId },
      });
    });
  });

  describe('Video constraints - размеры', () => {
    it('должен добавить ideal width при его передаче', () => {
      const result = prepareConstraints({ width: 1920 });

      expect(result.video).toEqual({
        width: { ideal: 1920 },
      });
    });

    it('должен добавить ideal height при его передаче', () => {
      const result = prepareConstraints({ height: 1080 });

      expect(result.video).toEqual({
        height: { ideal: 1080 },
      });
    });

    it('должен добавить ideal width и height при их передаче', () => {
      const result = prepareConstraints({ width: 1920, height: 1080 });

      expect(result.video).toEqual({
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      });
    });

    it('должен добавить max width при его передаче', () => {
      const result = prepareConstraints({ maxWidth: 1920 });

      expect(result.video).toEqual({
        width: { max: 1920 },
      });
    });

    it('должен добавить max height при его передаче', () => {
      const result = prepareConstraints({ maxHeight: 1080 });

      expect(result.video).toEqual({
        height: { max: 1080 },
      });
    });

    it('должен добавить min width при его передаче', () => {
      const result = prepareConstraints({ minWidth: 640 });

      expect(result.video).toEqual({
        width: { min: 640 },
      });
    });

    it('должен добавить min height при его передаче', () => {
      const result = prepareConstraints({ minHeight: 480 });

      expect(result.video).toEqual({
        height: { min: 480 },
      });
    });

    it('должен объединить ideal, max и min для width', () => {
      const result = prepareConstraints({
        width: 1920,
        maxWidth: 3840,
        minWidth: 640,
      });

      expect(result.video).toEqual({
        width: { ideal: 1920, max: 3840, min: 640 },
      });
    });

    it('должен объединить ideal, max и min для height', () => {
      const result = prepareConstraints({
        height: 1080,
        maxHeight: 2160,
        minHeight: 480,
      });

      expect(result.video).toEqual({
        height: { ideal: 1080, max: 2160, min: 480 },
      });
    });

    it('должен поддерживать строковые значения для размеров', () => {
      const result = prepareConstraints({
        width: '1920',
        height: '1080',
      });

      expect(result.video).toEqual({
        width: { ideal: '1920' },
        height: { ideal: '1080' },
      });
    });
  });

  describe('Video constraints - aspectRatio', () => {
    it('должен добавить ideal aspectRatio при его передаче как число', () => {
      const result = prepareConstraints({ aspectRatio: 1.777 });

      expect(result.video).toEqual({
        aspectRatio: { ideal: 1.777 },
      });
    });

    it('должен добавить ideal aspectRatio при его передаче как строка', () => {
      const result = prepareConstraints({ aspectRatio: '16:9' });

      expect(result.video).toEqual({
        aspectRatio: { ideal: '16:9' },
      });
    });
  });

  describe('Video constraints - mediaSource', () => {
    it('должен добавить mozMediaSource при его передаче', () => {
      const mozMediaSource = 'screen';
      const result = prepareConstraints({ mozMediaSource });

      expect(result.video).toEqual({
        mozMediaSource: 'screen',
      });
    });

    it('должен добавить mediaSource при его передаче', () => {
      const mediaSource = 'screen';
      const result = prepareConstraints({ mediaSource });

      expect(result.video).toEqual({
        mediaSource: 'screen',
      });
    });

    it('должен добавить mozMediaSource и mediaSource при их передаче', () => {
      const result = prepareConstraints({
        mozMediaSource: 'screen',
        mediaSource: 'window',
      });

      expect(result.video).toEqual({
        mozMediaSource: 'screen',
        mediaSource: 'window',
      });
    });
  });

  describe('Комбинированные constraints', () => {
    it('должен объединить все video constraints при их передаче', () => {
      const result = prepareConstraints({
        videoDeviceId: 'device-123',
        width: 1920,
        height: 1080,
        maxWidth: 3840,
        maxHeight: 2160,
        minWidth: 640,
        minHeight: 480,
        aspectRatio: 1.777,
        mediaSource: 'screen',
      });

      expect(result.video).toEqual({
        deviceId: { exact: 'device-123' },
        width: { ideal: 1920, max: 3840, min: 640 },
        height: { ideal: 1080, max: 2160, min: 480 },
        aspectRatio: { ideal: 1.777 },
        mediaSource: 'screen',
      });
    });

    it('должен создать полные audio и video constraints при передаче всех параметров', () => {
      const result = prepareConstraints({
        audio: true,
        video: true,
        audioDeviceId: 'audio-123',
        videoDeviceId: 'video-456',
        width: 1920,
        height: 1080,
        echoCancellation: true,
        sampleRate: 48_000,
      });

      expect(result).toEqual({
        audio: {
          deviceId: { exact: 'audio-123' },
          echoCancellation: true,
          sampleRate: 48_000,
        },
        video: {
          deviceId: { exact: 'video-456' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
    });
  });

  describe('Краевые случаи', () => {
    it('должен игнорировать undefined значения в video constraints', () => {
      const result = prepareConstraints({
        width: undefined,
        height: undefined,
        aspectRatio: undefined,
      });

      expect(result.video).toBe(true);
    });

    it('должен игнорировать 0 как значение для width', () => {
      const result = prepareConstraints({ width: 0 });

      expect(result.video).toBe(true);
    });

    it('должен игнорировать пустую строку как значение для width', () => {
      const result = prepareConstraints({ width: '' });

      expect(result.video).toBe(true);
    });

    it('должен игнорировать false как значение для mediaSource', () => {
      const result = prepareConstraints({ mediaSource: false });

      expect(result.video).toBe(true);
    });
  });
});
