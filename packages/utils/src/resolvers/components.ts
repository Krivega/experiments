import type {
  Callback,
  TDataValue,
  TMods,
  TRecordMods,
  TRecordProperties,
  TSettingsMods,
  TTypeProperties,
  TValuesMods,
} from './types';

export function noop(): void {
  return undefined;
}

const snakeCase = (name: TRecordMods): string => {
  const s = String(name);

  return s.replaceAll(/\.?([A-Z]+)/g, (_x: string, y: string) => {
    return `-${y.toLowerCase()}`;
  });
};

export const resolveEventHandler = <E, V>(parser: (event: E) => V) => {
  return (callback: Callback<V> = noop) => {
    return (event: E) => {
      const value = parser(event);

      if (value !== undefined) {
        callback(value);
      }
    };
  };
};

const getModsSettings = ({
  data,
  settings = [],
}: {
  settings?: readonly TRecordMods[];
  data: Record<TRecordMods, TDataValue>;
}): TSettingsMods => {
  return settings.reduce<Record<TRecordMods, boolean>>((accumulator, key) => {
    const name = snakeCase(key);
    const value = data[key];

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    accumulator[name] = !!value;

    return accumulator;
  }, {});
};

const getModsValues = ({
  values = [],
  data,
}: {
  values?: readonly TRecordMods[];
  data: Record<TRecordMods, TDataValue>;
}): TValuesMods => {
  return values.reduce<Record<TRecordMods, string>>((accumulator, key) => {
    const name = snakeCase(key);
    const value = data[key] as string;

    accumulator[name] = value;

    return accumulator;
  }, {});
};

const getMods = (
  data: Record<string, TDataValue>,
  settings?: readonly TRecordMods[],
  values?: readonly TRecordMods[],
): TMods => {
  const modsSettings = getModsSettings({ settings, data });
  const modsValues = getModsValues({ values, data });

  const mods: TMods = { ...modsSettings, ...modsValues } as TMods;

  return mods;
};

/**
 * @deprecated deprecated use resolveGetBemModsWithType
 */
export const resolveGetBemMods = <
  P extends Record<string, unknown> = Record<string, unknown>,
  S extends readonly (keyof P)[] = readonly string[],
  V extends readonly (keyof P)[] = readonly string[],
>({
  settings,
  values,
}: {
  settings?: S;
  values?: V;
}) => {
  return (properties: TRecordProperties<P, S> & TRecordProperties<P, V>): TMods => {
    const mods = getMods(properties, settings, values);

    return mods;
  };
};

export const resolveGetBemModsWithType = <
  S extends readonly string[],
  V extends readonly string[],
  P extends TTypeProperties<S> & TTypeProperties<V>,
>({
  settings,
  values,
}: {
  settings: S;
  values: V;
}) => {
  return resolveGetBemMods<P, S, V>({
    settings,
    values,
  });
};

export const preventDefault = <
  T extends { preventDefault: () => void; stopPropagation: () => void },
>(
  event: T,
) => {
  event.preventDefault();
  event.stopPropagation();

  return event;
};

export const blurCurrentTarget = <T extends { currentTarget?: { blur: () => void } }>(event: T) => {
  event.currentTarget?.blur();

  return event;
};

export const passiveEventOptions = { passive: true };
