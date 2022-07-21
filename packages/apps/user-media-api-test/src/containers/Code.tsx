import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import type { TVideoConstraints, TAudioConstraints } from '../typings';

type TProps = {
  classes;
  heading: string;
  settings: { audio: boolean | TAudioConstraints; video: TVideoConstraints };
};

const Code: React.FC<TProps> = ({ classes, settings, heading }) => {
  if (Object.keys(settings.video).length === 0) {
    return null;
  }

  return (
    <Card variant="outlined" className={classes.card}>
      <CardHeader title={heading} />
      <CardContent>
        <pre>{JSON.stringify(settings, null, 2)}</pre>
      </CardContent>
    </Card>
  );
};

export default Code;
