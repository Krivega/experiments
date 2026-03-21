/// <reference types="jest" />
import setSinkId from '../setSinkId';

type TMedia = HTMLAudioElement | HTMLVideoElement;

describe('setSinkId', () => {
  let debug: (message: string, ...parameters: unknown[]) => void;

  beforeEach(() => {
    debug = jest.fn();
  });

  it('should call setSinkId method on mediaElement if available and valid sinkId is provided', async () => {
    const mediaElement = {
      setSinkId: jest.fn().mockResolvedValue(''),
      sinkId: 'default',
    };

    await setSinkId(mediaElement as unknown as TMedia, 'output-device', debug);

    expect(mediaElement.setSinkId).toHaveBeenCalledWith('output-device');
    expect(debug).toHaveBeenCalledTimes(2);
    expect(debug).toHaveBeenNthCalledWith(2, 'setSinkId sinkId !!!SET!!!', 'output-device');
  });

  it('should not call setSinkId method on mediaElement if sinkId is not valid', async () => {
    const mediaElement = {
      setSinkId: jest.fn().mockResolvedValue(''),
      sinkId: 'default',
    };

    await setSinkId(mediaElement as unknown as TMedia, '', debug);

    expect(mediaElement.setSinkId).not.toHaveBeenCalled();
    expect(debug).toHaveBeenCalledTimes(1);
  });

  it('should not call setSinkId method on mediaElement if sinkId is the same as current sinkId', async () => {
    const mediaElement = {
      setSinkId: jest.fn().mockResolvedValue(''),
      sinkId: 'output-device',
    };

    await setSinkId(mediaElement as unknown as TMedia, 'output-device', debug);

    expect(mediaElement.setSinkId).not.toHaveBeenCalled();
    expect(debug).toHaveBeenCalledTimes(1);
  });

  it('should not call setSinkId method on mediaElement if sinkId is "default" and current sinkId is empty', async () => {
    const mediaElement = {
      setSinkId: jest.fn().mockResolvedValue(''),
      sinkId: '',
    };

    await setSinkId(mediaElement as unknown as TMedia, 'default', debug);

    expect(mediaElement.setSinkId).not.toHaveBeenCalled();
    expect(debug).toHaveBeenCalledTimes(1);
  });

  it('should not call setSinkId method on mediaElement if sinkId is "default" and current sinkId is undefined', async () => {
    const mediaElement = {
      setSinkId: jest.fn().mockResolvedValue(''),
    };

    await setSinkId(mediaElement as unknown as TMedia, 'default', debug);

    expect(mediaElement.setSinkId).not.toHaveBeenCalled();
    expect(debug).toHaveBeenCalledTimes(1);
  });

  it('should catch and log error if setSinkId method throws an error', async () => {
    const mediaElement = {
      setSinkId: jest.fn().mockRejectedValue(new Error('Failed to set sinkId')),
      sinkId: 'default',
    };

    await setSinkId(mediaElement as unknown as TMedia, 'output-device', debug);

    expect(debug).toHaveBeenCalledTimes(3);
    expect(debug).toHaveBeenNthCalledWith(
      3,
      'setSinkId error',
      mediaElement,
      new Error('Failed to set sinkId'),
    );
  });

  it('should work without debug parameter', async () => {
    const mediaElement = {
      setSinkId: jest.fn().mockResolvedValue(''),
      sinkId: 'default',
    };

    // Should not throw error when debug parameter is omitted
    await expect(setSinkId(mediaElement as unknown as TMedia, 'output-device')).resolves.toBe('');

    expect(mediaElement.setSinkId).toHaveBeenCalledWith('output-device');
  });

  it('should handle error without debug parameter', async () => {
    const mediaElement = {
      setSinkId: jest.fn().mockRejectedValue(new Error('Failed to set sinkId')),
      sinkId: 'default',
    };

    // Should not throw error when debug parameter is omitted and setSinkId fails
    await expect(
      setSinkId(mediaElement as unknown as TMedia, 'output-device'),
    ).resolves.toBeUndefined();
  });
});
