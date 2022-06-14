import Stats from 'stats-js';

const createFpsMeter = () => {
  let stats;
  let isBegined = false;
  let isEnded = true;
  const init = () => {
    isBegined = false;
    isEnded = true;
    stats = new Stats();
    stats.showPanel(0);

    document.body.appendChild(stats.dom);
  };
  const begin = () => {
    if (stats && isEnded && !isBegined) {
      isEnded = false;
      isBegined = true;
      stats.begin();
    }
  };
  const end = () => {
    if (stats && isBegined && !isEnded) {
      isEnded = true;
      isBegined = false;
      stats.end();
    }
  };
  const reset = () => {
    document.body.removeChild(stats.dom);
    stats = undefined;
  };

  return { init, begin, end, reset };
};

export default createFpsMeter;
