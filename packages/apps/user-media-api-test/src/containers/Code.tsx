import React from 'react';
import type { TVideoConstraints, TAudioConstraints } from '../typings';

type TProps = {
  videoSettings: { audio: boolean | TAudioConstraints; video: TVideoConstraints };
};

const Code: React.FC<TProps> = ({ videoSettings }) => {
  if (Object.keys(videoSettings).length === 0) {
    return null;
  }

  return <pre>{JSON.stringify(videoSettings, null, 2)}</pre>;
};

export default Code;
