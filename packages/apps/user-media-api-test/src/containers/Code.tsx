import React from 'react';

const Code = ({ videoSettings }) => {
  if (Object.keys(videoSettings).length === 0) {
    return null;
  }

  return <pre>{JSON.stringify(videoSettings, null, 2)}</pre>;
};

export default Code;
