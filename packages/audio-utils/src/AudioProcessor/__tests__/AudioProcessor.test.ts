/// <reference types="jest" />
/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  createAudioContextAudioMediaStreamTrackMock,
  createAudioMediaStreamTrackMock,
} from 'webrtc-mock';

import { AudioProcessor } from '../..';
import { AudioTrackMixer } from '../../AudioTrackMixer';

declare let global: {
  isRunningAudioContextStateByDefault: boolean;
};

const addTrackFromMixerMock = jest.spyOn(AudioTrackMixer.prototype, 'addTrack');
const removeTrackFromMixerMock = jest.spyOn(AudioTrackMixer.prototype, 'removeTrack');
const setTrackVolumeFromMixerMock = jest.spyOn(AudioTrackMixer.prototype, 'setTrackVolume');

const baseTrack = createAudioContextAudioMediaStreamTrackMock();

describe('AudioProcessor', () => {
  const trackId = 'trackId';

  beforeEach(() => {
    global.isRunningAudioContextStateByDefault = false;
    addTrackFromMixerMock.mockClear();
    removeTrackFromMixerMock.mockClear();
    setTrackVolumeFromMixerMock.mockClear();
  });

  it('#0 init', () => {
    // eslint-disable-next-line no-new
    new AudioProcessor();

    expect(addTrackFromMixerMock).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(addTrackFromMixerMock.mock.calls)).toEqual(JSON.stringify([[baseTrack]]));
  });

  it('#1 add/get track', () => {
    const audioProcessor = new AudioProcessor();
    const track = createAudioMediaStreamTrackMock();

    // @ts-expect-error
    audioProcessor.addTrack(trackId, track);

    const receivedTrack = audioProcessor.getTrack(trackId);

    expect(receivedTrack).toEqual(track);
    expect(removeTrackFromMixerMock).toHaveBeenCalledTimes(0);
    expect(addTrackFromMixerMock).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(addTrackFromMixerMock.mock.calls)).toEqual(
      JSON.stringify([[baseTrack], [track]]),
    );
  });

  it('#2 second add/get track with same id', () => {
    const audioProcessor = new AudioProcessor();
    const track1 = createAudioMediaStreamTrackMock();
    const track2 = createAudioMediaStreamTrackMock();

    // @ts-expect-error
    audioProcessor.addTrack(trackId, track1);
    // @ts-expect-error
    audioProcessor.addTrack(trackId, track2);

    const receivedTrack = audioProcessor.getTrack(trackId);

    expect(receivedTrack).toEqual(track2);
    expect(removeTrackFromMixerMock).toHaveBeenCalledTimes(1);
    expect(removeTrackFromMixerMock).toHaveBeenCalledWith(track1);
    expect(addTrackFromMixerMock).toHaveBeenCalledTimes(3);
    expect(JSON.stringify(addTrackFromMixerMock.mock.calls)).toEqual(
      JSON.stringify([[baseTrack], [track1], [track2]]),
    );
  });

  it('#3 get track: by incorrect track id', () => {
    const audioProcessor = new AudioProcessor();
    const incorrectTrackId = 'incorrect-track-id';
    const track = createAudioMediaStreamTrackMock();

    // @ts-expect-error
    audioProcessor.addTrack('id', track);

    const receivedTrack = audioProcessor.getTrack(incorrectTrackId);

    expect(receivedTrack).toEqual(undefined);
  });

  it('#4 remove track', () => {
    const audioProcessor = new AudioProcessor();
    const track = createAudioMediaStreamTrackMock();

    // @ts-expect-error
    audioProcessor.addTrack(trackId, track);
    audioProcessor.removeTrack(trackId);

    const receivedTrack = audioProcessor.getTrack(trackId);

    expect(receivedTrack).toBe(undefined);
  });

  it('#5 set track volume', () => {
    const audioProcessor = new AudioProcessor();
    const newVolume = 0.5;
    const track = createAudioMediaStreamTrackMock();

    // @ts-expect-error
    audioProcessor.addTrack(trackId, track);

    audioProcessor.setVolume(trackId, newVolume);

    expect(setTrackVolumeFromMixerMock).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(setTrackVolumeFromMixerMock.mock.calls)).toEqual(
      JSON.stringify([[track, newVolume]]),
    );
  });

  it('#6 get result without tracks', () => {
    const audioProcessor = new AudioProcessor();
    const result = audioProcessor.getResult();

    expect(result.kind).toBe('audio');
  });

  it('#7 get result with tracks', () => {
    const audioProcessor = new AudioProcessor();
    const track = createAudioMediaStreamTrackMock();

    // @ts-expect-error
    audioProcessor.addTrack(trackId, track);

    const result = audioProcessor.getResult();

    expect(result.kind).toBe('audio');
  });

  it('#8 add processor', () => {
    const audioProcessor = new AudioProcessor();
    const processor: jest.Mock<
      void,
      [
        {
          audioContext: AudioContext;
          mediaStreamDestination: MediaStreamAudioDestinationNode;
        },
      ],
      unknown
    > = jest.fn(
      (_parameters: {
        audioContext: AudioContext;
        mediaStreamDestination: MediaStreamAudioDestinationNode;
      }) => {},
    );

    audioProcessor.addProcessor(processor);

    const parameters = processor.mock.calls[0][0];

    expect(parameters.audioContext).toBeDefined();
    expect(parameters.mediaStreamDestination).toBeDefined();
  });

  it('#9 resume audioContext after user click', async () => {
    const audioProcessor = new AudioProcessor();

    await new Promise((resolve) => {
      // @ts-expect-error
      audioProcessor.audioContext.addEventListener('statechange', resolve);
      // @ts-expect-error
      audioProcessor.audioContext.suspend();
    });

    return new Promise((resolve) => {
      // @ts-expect-error
      audioProcessor.audioContext.addEventListener('statechange', resolve);
      document.body.dispatchEvent(new Event('click'));
    }).then(() => {
      // @ts-expect-error
      expect(audioProcessor.mixerAudioContext.state).toBe('running');
      // @ts-expect-error
      expect(audioProcessor.audioContext.state).toBe('running');
    });
  });

  it('#10 resume audioContext after user keydown', async () => {
    const audioProcessor = new AudioProcessor();

    await new Promise((resolve) => {
      // @ts-expect-error
      audioProcessor.audioContext.addEventListener('statechange', resolve);
      // @ts-expect-error
      audioProcessor.audioContext.suspend();
    });

    return new Promise((resolve) => {
      // @ts-expect-error
      audioProcessor.audioContext.addEventListener('statechange', resolve);
      document.body.dispatchEvent(new Event('keydown'));
    }).then(() => {
      // @ts-expect-error
      expect(audioProcessor.mixerAudioContext.state).toBe('running');
      // @ts-expect-error
      expect(audioProcessor.audioContext.state).toBe('running');
    });
  });

  it('#11 resume audioContext after suspend after user click', async () => {
    global.isRunningAudioContextStateByDefault = true;

    const audioProcessor = new AudioProcessor();

    return new Promise((resolve) => {
      // @ts-expect-error
      audioProcessor.audioContext.addEventListener('statechange', resolve);
      // @ts-expect-error
      audioProcessor.audioContext.suspend();
    })
      .then(async () => {
        return new Promise((resolve) => {
          // @ts-expect-error
          audioProcessor.audioContext.addEventListener('statechange', resolve);
          document.body.dispatchEvent(new Event('click'));
        });
      })
      .then(() => {
        // @ts-expect-error
        expect(audioProcessor.mixerAudioContext.state).toBe('running');
        // @ts-expect-error
        expect(audioProcessor.audioContext.state).toBe('running');
      });
  });

  it('#12 resume audioContext after suspend after user keydown', async () => {
    global.isRunningAudioContextStateByDefault = true;

    const audioProcessor = new AudioProcessor();

    return new Promise((resolve) => {
      // @ts-expect-error
      audioProcessor.audioContext.addEventListener('statechange', resolve);
      // @ts-expect-error
      audioProcessor.audioContext.suspend();
    })
      .then(async () => {
        return new Promise((resolve) => {
          // @ts-expect-error
          audioProcessor.audioContext.addEventListener('statechange', resolve);
          document.body.dispatchEvent(new Event('keydown'));
        });
      })
      .then(() => {
        // @ts-expect-error
        expect(audioProcessor.mixerAudioContext.state).toBe('running');
        // @ts-expect-error
        expect(audioProcessor.audioContext.state).toBe('running');
      });
  });

  it('#13 resume mixer audioContext after user click', async () => {
    const audioProcessor = new AudioProcessor();

    await new Promise((resolve) => {
      // @ts-expect-error
      audioProcessor.mixerAudioContext.addEventListener('statechange', resolve);
      // @ts-expect-error
      audioProcessor.mixerAudioContext.suspend();
    });

    return new Promise((resolve) => {
      // @ts-expect-error
      audioProcessor.mixerAudioContext.addEventListener('statechange', resolve);
      document.body.dispatchEvent(new Event('click'));
    }).then(() => {
      // @ts-expect-error
      expect(audioProcessor.mixerAudioContext.state).toBe('running');
      // @ts-expect-error
      expect(audioProcessor.audioContext.state).toBe('running');
    });
  });

  it('#14 resume mixer audioContext after user keydown', async () => {
    const audioProcessor = new AudioProcessor();

    await new Promise((resolve) => {
      // @ts-expect-error
      audioProcessor.mixerAudioContext.addEventListener('statechange', resolve);
      // @ts-expect-error
      audioProcessor.mixerAudioContext.suspend();
    });

    return new Promise((resolve) => {
      // @ts-expect-error
      audioProcessor.mixerAudioContext.addEventListener('statechange', resolve);
      document.body.dispatchEvent(new Event('keydown'));
    }).then(() => {
      // @ts-expect-error
      expect(audioProcessor.mixerAudioContext.state).toBe('running');
      // @ts-expect-error
      expect(audioProcessor.audioContext.state).toBe('running');
    });
  });

  it('#15 resume mixer audioContext after suspend after user click', async () => {
    global.isRunningAudioContextStateByDefault = true;

    const audioProcessor = new AudioProcessor();

    return new Promise((resolve) => {
      // @ts-expect-error
      audioProcessor.mixerAudioContext.addEventListener('statechange', resolve);
      // @ts-expect-error
      audioProcessor.mixerAudioContext.suspend();
    })
      .then(async () => {
        return new Promise((resolve) => {
          // @ts-expect-error
          audioProcessor.mixerAudioContext.addEventListener('statechange', resolve);
          document.body.dispatchEvent(new Event('click'));
        });
      })
      .then(() => {
        // @ts-expect-error
        expect(audioProcessor.mixerAudioContext.state).toBe('running');
        // @ts-expect-error
        expect(audioProcessor.audioContext.state).toBe('running');
      });
  });

  it('#16 resume mixer audioContext after suspend after user keydown', async () => {
    global.isRunningAudioContextStateByDefault = true;

    const audioProcessor = new AudioProcessor();

    return new Promise((resolve) => {
      // @ts-expect-error
      audioProcessor.mixerAudioContext.addEventListener('statechange', resolve);
      // @ts-expect-error
      audioProcessor.mixerAudioContext.suspend();
    })
      .then(async () => {
        return new Promise((resolve) => {
          // @ts-expect-error
          audioProcessor.mixerAudioContext.addEventListener('statechange', resolve);
          document.body.dispatchEvent(new Event('keydown'));
        });
      })
      .then(() => {
        // @ts-expect-error
        expect(audioProcessor.mixerAudioContext.state).toBe('running');
        // @ts-expect-error
        expect(audioProcessor.audioContext.state).toBe('running');
      });
  });

  it('#17 mute track by id', () => {
    const audioProcessor = new AudioProcessor();
    const track = createAudioMediaStreamTrackMock();

    // @ts-expect-error
    audioProcessor.addTrack(trackId, track);
    audioProcessor.muteTrack(trackId);

    const audioTrack = audioProcessor.getTrack(trackId);

    expect(audioTrack?.enabled).toBe(false);
  });

  it('#18 unmute track by id', () => {
    const audioProcessor = new AudioProcessor();
    const track = createAudioMediaStreamTrackMock();

    // @ts-expect-error
    audioProcessor.addTrack(trackId, track);
    audioProcessor.muteTrack(trackId);
    audioProcessor.unmuteTrack(trackId);

    const audioTrack = audioProcessor.getTrack(trackId);

    expect(audioTrack?.enabled).toBe(true);
  });

  it('#19 should not be muted other tracks', () => {
    const audioProcessor = new AudioProcessor();
    const firstTrack = createAudioMediaStreamTrackMock({ id: 'firstTrackId' });
    const secondTrack = createAudioMediaStreamTrackMock({ id: 'secondTrackId' });

    // @ts-expect-error
    audioProcessor.addTrack(firstTrack.id, firstTrack);
    // @ts-expect-error
    audioProcessor.addTrack(secondTrack.id, secondTrack);

    audioProcessor.muteTrack(firstTrack.id);

    const firstSavedAudioTrack = audioProcessor.getTrack(firstTrack.id);
    const secondSavedAudioTrack = audioProcessor.getTrack(secondTrack.id);

    expect(firstSavedAudioTrack?.enabled).toBe(false);
    expect(secondSavedAudioTrack?.enabled).toBe(true);
  });

  it('#20 should not be unmuted other tracks', () => {
    const audioProcessor = new AudioProcessor();
    const firstTrack = createAudioMediaStreamTrackMock({ id: 'firstTrackId' });
    const secondTrack = createAudioMediaStreamTrackMock({ id: 'secondTrackId' });

    // @ts-expect-error
    audioProcessor.addTrack(firstTrack.id, firstTrack);
    audioProcessor.muteTrack(firstTrack.id);
    // @ts-expect-error
    audioProcessor.addTrack(secondTrack.id, secondTrack);
    audioProcessor.muteTrack(secondTrack.id);

    audioProcessor.unmuteTrack(firstTrack.id);

    const firstSavedAudioTrack = audioProcessor.getTrack(firstTrack.id);
    const secondSavedAudioTrack = audioProcessor.getTrack(secondTrack.id);

    expect(firstSavedAudioTrack?.enabled).toBe(true);
    expect(secondSavedAudioTrack?.enabled).toBe(false);
  });

  it('#21 should be saved track id for mute before adding', () => {
    const audioProcessor = new AudioProcessor();
    const audioTrack = createAudioMediaStreamTrackMock();

    audioProcessor.muteTrack(trackId);

    // @ts-expect-error
    audioProcessor.addTrack(trackId, audioTrack);

    const savedAudioTrack = audioProcessor.getTrack(trackId);

    expect(savedAudioTrack?.enabled).toBe(false);
  });

  it('#22 should be removed track id for mute before adding', () => {
    const audioProcessor = new AudioProcessor();
    const audioTrack = createAudioMediaStreamTrackMock();

    audioProcessor.muteTrack(trackId);
    audioProcessor.unmuteTrack(trackId);

    // @ts-expect-error
    audioProcessor.addTrack(trackId, audioTrack);

    const savedAudioTrack = audioProcessor.getTrack(trackId);

    expect(savedAudioTrack?.enabled).toBe(true);
  });

  it('#23 should be saved mute state when track has removed and added again', () => {
    const audioProcessor = new AudioProcessor();
    const audioTrack = createAudioMediaStreamTrackMock();

    audioProcessor.muteTrack(trackId);

    // @ts-expect-error
    audioProcessor.addTrack(trackId, audioTrack);
    audioProcessor.removeTrack(trackId);
    // @ts-expect-error
    audioProcessor.addTrack(trackId, audioTrack);

    const savedAudioTrack = audioProcessor.getTrack(trackId);

    expect(savedAudioTrack?.enabled).toBe(false);
  });

  it('#24 should unmute muted track right after add when track has not exist in mute state', () => {
    const audioProcessor = new AudioProcessor();
    const audioTrack = createAudioMediaStreamTrackMock();

    audioTrack.enabled = false;

    // @ts-expect-error
    audioProcessor.addTrack(trackId, audioTrack);

    const savedAudioTrack = audioProcessor.getTrack(trackId);

    expect(savedAudioTrack?.enabled).toBe(true);
  });

  it('#25 isMutedTrack', () => {
    const audioProcessor = new AudioProcessor();
    const track = createAudioMediaStreamTrackMock();

    // @ts-expect-error
    audioProcessor.addTrack(trackId, track);
    audioProcessor.muteTrack(trackId);

    expect(audioProcessor.isMutedTrack(trackId)).toBe(true);

    audioProcessor.unmuteTrack(trackId);

    expect(audioProcessor.isMutedTrack(trackId)).toBe(false);
  });

  it('#26 isExistTrack', () => {
    const audioProcessor = new AudioProcessor();
    const track = createAudioMediaStreamTrackMock();

    // @ts-expect-error
    audioProcessor.addTrack(trackId, track);

    expect(audioProcessor.isExistTrack(trackId)).toBe(true);

    audioProcessor.removeTrack(trackId);

    expect(audioProcessor.isExistTrack(trackId)).toBe(false);
  });

  it('#27 stopAndRemoveTrack: should be stopped and removed audio track by trackId', () => {
    const audioProcessor = new AudioProcessor();
    const track = createAudioMediaStreamTrackMock();

    // @ts-expect-error
    audioProcessor.addTrack(trackId, track);

    audioProcessor.stopAndRemoveTrack(trackId);

    const receivedTrack = audioProcessor.getTrack(trackId);

    expect(track.readyState).toBe('ended');
    expect(receivedTrack).toBe(undefined);
  });

  it('#28 stopAndRemoveTrack: should not be stopped another audio tracks', () => {
    const audioProcessor = new AudioProcessor();
    const track = createAudioMediaStreamTrackMock({ id: 'audioDeviceId' });

    // @ts-expect-error
    audioProcessor.addTrack(trackId, track);

    const anotherTrackId = 'another-track-id';
    const anotherTrack = createAudioMediaStreamTrackMock({ id: 'anotherAudioDeviceId' });

    // @ts-expect-error
    audioProcessor.addTrack(anotherTrackId, anotherTrack);

    audioProcessor.stopAndRemoveTrack(trackId);

    expect(anotherTrack.readyState).toBe('live');
  });
});
