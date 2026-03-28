/// <reference types="jest" />
/// <reference types="jest-extended" />

import {
  blurCurrentTarget,
  preventDefault,
  resolveEventHandler,
  resolveGetBemMods,
  resolveGetBemModsWithType,
} from '../components';

type TEventMocked = {
  target: {
    value: string;
  };
  currentTarget: {
    blur: () => void;
  };
  preventDefault: () => void;
  stopPropagation: () => void;
};

describe('components', () => {
  const valueMocked = 'valueMocked';

  const eventMocked: TEventMocked = {
    target: {
      value: valueMocked,
    },
    currentTarget: {
      blur: jest.fn(),
    },
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  };

  const eventParser = (event: TEventMocked) => {
    return event.target.value;
  };

  beforeEach(() => {
    eventMocked.currentTarget.blur = jest.fn();
    eventMocked.stopPropagation = jest.fn();
    eventMocked.stopPropagation = jest.fn();
  });

  it('resolveEventHandler', () => {
    const callbackMocked = jest.fn();

    const resolveHandler = resolveEventHandler(eventParser);

    const handler = resolveHandler(callbackMocked);

    handler(eventMocked);

    expect(callbackMocked).toHaveBeenCalledOnce();
    expect(callbackMocked).toHaveBeenCalledWith(valueMocked);
  });

  it('resolveGetBemMods', () => {
    const settings: readonly string[] = ['firstSetting', 'secondSetting'];
    const values: readonly string[] = ['firstValue', 'secondValue'];

    const properties = {
      firstSetting: true,
      secondSetting: false,
      firstValue: 'value1',
      secondValue: 'value2',
    };

    const getBemMods = resolveGetBemMods({ settings, values });

    const mods = getBemMods(properties);

    expect(mods).toEqual({
      'first-setting': true,
      'second-setting': false,
      'first-value': 'value1',
      'second-value': 'value2',
    });
  });

  it('resolveGetBemModsWithType', () => {
    const settings: readonly string[] = ['firstSetting', 'secondSetting'];
    const values: readonly string[] = ['firstValue', 'secondValue'];

    const properties = {
      firstSetting: true,
      secondSetting: false,
      firstValue: 'value1',
      secondValue: 'value2',
    };

    const getBemMods = resolveGetBemModsWithType({ settings, values });

    const mods = getBemMods(properties);

    expect(mods).toEqual({
      'first-setting': true,
      'second-setting': false,
      'first-value': 'value1',
      'second-value': 'value2',
    });
  });

  it('preventDefault', () => {
    const result = preventDefault(eventMocked);

    expect(result).toEqual(eventMocked);
    expect(eventMocked.preventDefault).toHaveBeenCalledOnce();
    expect(eventMocked.stopPropagation).toHaveBeenCalledOnce();
  });

  it('blurCurrentTarget', () => {
    const result = blurCurrentTarget(eventMocked);

    expect(result).toEqual(eventMocked);
    expect(eventMocked.currentTarget.blur).toHaveBeenCalledOnce();
  });
});
