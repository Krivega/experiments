type TIntlConfig = {
  locale: string;
  messages?: Record<string, string>;
};

const createIntlCache = () => {
  return {};
};

const createIntl = (config: TIntlConfig) => {
  return {
    ...config,
    formatMessage: (descriptor: { id: string }, _values?: Record<string, string | number>) => {
      // Для целей тестов достаточно вернуть id сообщения
      return descriptor.id;
    },
  };
};

export default {
  createIntlCache,
  createIntl,
};
