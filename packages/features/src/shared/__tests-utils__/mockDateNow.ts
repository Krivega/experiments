const nowActual = Date.now;

const mock = ({ valueMocked }: { valueMocked: number }) => {
  Date.now = () => {
    return valueMocked;
  };
};

const restore = () => {
  Date.now = nowActual;
};

export default {
  mock,
  restore,
};
