/* eslint-disable react/jsx-max-depth */
import { AsideHeader, Heading } from '@experiments/components';
import Toolbar from '@mui/material/Toolbar';

import { NavTabs } from './NavTabs';

export const AppToolbarNav = () => {
  return (
    <Toolbar disableGutters sx={{ gap: 2, px: 2 }}>
      <AsideHeader>
        <Heading type="body1">
          FEATURES <sup>alpha</sup>
        </Heading>

        <NavTabs />
      </AsideHeader>
    </Toolbar>
  );
};
