/// <reference types="jest" />

import sendConstraintsSequently from '../sendConstraintsSequently';

import type { TAvailableSettings } from '../typings';

const valueSharpness = 1000;
const valueColorTemperature = 4750;
const whiteBalanceMode = 'manual';

describe('sendConstraintsSequently', () => {
  let videoTrack: MediaStreamVideoTrack;
  let constraintsState: TAvailableSettings;

  beforeEach(() => {
    videoTrack = {
      getCapabilities: () => {
        const capabilitiesMocked = {
          sharpness: { min: 0, max: 7000, step: 10 },
          colorTemperature: { min: 0, max: 7000, step: 10 },
          whiteBalanceMode: ['continuous', 'manual'],
        } as unknown as MediaTrackSettings;

        return capabilitiesMocked;
      },

      getSettings: () => {
        const settingsMocked = {
          sharpness: 0,
          colorTemperature: 0,
          whiteBalanceMode: 'continuous',
        } as unknown as MediaTrackSettings;

        return settingsMocked;
      },
      // @ts-ignore
      applyConstraints: jest.fn(async () => {}),
    } as unknown as MediaStreamVideoTrack;
  });

  it('#1 should be sent constraints to video track sequently', async () => {
    constraintsState = {
      sharpness: {
        value: valueSharpness,
      },
      colorTemperature: {
        value: valueColorTemperature,
        mode: {
          whiteBalanceMode,
        },
      },
    };

    await sendConstraintsSequently(videoTrack, constraintsState);

    expect(videoTrack.applyConstraints).toHaveBeenCalledTimes(2);
    expect(videoTrack.applyConstraints).toHaveBeenNthCalledWith(1, {
      advanced: [{ sharpness: valueSharpness }],
    });
    expect(videoTrack.applyConstraints).toHaveBeenNthCalledWith(2, {
      advanced: [
        {
          whiteBalanceMode,
          colorTemperature: valueColorTemperature,
        },
      ],
    });
  });
});
