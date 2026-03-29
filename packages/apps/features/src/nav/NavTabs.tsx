import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Link, useLocation } from 'react-router-dom';

import { routeTabs } from './routeTabs';

export const NavTabs = () => {
  const location = useLocation();
  let tabValue: false | (typeof routeTabs)[number]['path'] = false;

  for (const item of routeTabs) {
    if (item.path === location.pathname) {
      tabValue = item.path;
      break;
    }
  }

  return (
    <Tabs
      aria-label="Разделы приложения"
      indicatorColor="secondary"
      sx={{ minHeight: 48 }}
      textColor="inherit"
      value={tabValue === false ? false : tabValue}
    >
      {routeTabs.map((item) => {
        return (
          <Tab
            component={Link}
            key={item.path}
            label={item.label}
            to={item.path}
            value={item.path}
          />
        );
      })}
    </Tabs>
  );
};
