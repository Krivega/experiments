import React from 'react';

const Code = ({ videoSettings }) => {
  return <pre>{JSON.stringify(videoSettings, null, 2)}</pre>;
};

export default Code;
