import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import React from 'react';

import type { TClasses } from '../useStyles';

type TProps = {
  classes: TClasses;
  heading: string;
  settings: { audio: boolean | MediaTrackConstraints; video: MediaTrackConstraints };
};

const Code: React.FC<TProps> = ({ classes, settings, heading }) => {
  if (Object.keys(settings.video).length === 0) {
    return undefined;
  }

  return (
    <Card className={classes.card} variant="outlined">
      <CardHeader title={heading} />

      <CardContent>
        <pre>{JSON.stringify(settings, undefined, 2)}</pre>
      </CardContent>
    </Card>
  );
};

export default Code;
