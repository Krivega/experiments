import Stats from 'stats-js';

const createFpsMeter = () => {
  let stats;
  let isBegins = false;
  let isEnded = true;
  const init = () => {
    isBegins = false;
    isEnded = true;
    stats = new Stats();
    stats.showPanel(0);

    document.body.appendChild(stats.dom);
  };
  const begin = () => {
    if (stats && isEnded && !isBegins) {
      isEnded = false;
      isBegins = true;
      stats.begin();
    }
  };
  const end = () => {
    if (stats && isBegins && !isEnded) {
      isEnded = true;
      isBegins = false;
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
