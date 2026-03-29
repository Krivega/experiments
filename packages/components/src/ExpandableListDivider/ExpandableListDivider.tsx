import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import type { FC, PropsWithChildren, ReactNode } from 'react';

export type TExpandableListDividerProps = {
  active: boolean;
  title: ReactNode;
};

const ExpandableListDivider: FC<PropsWithChildren<TExpandableListDividerProps>> = ({
  active,
  children,
  title,
}) => {
  return (
    <Accordion
      disableGutters
      elevation={0}
      expanded={active}
      sx={{ '&:before': { display: 'none' } }}
    >
      <AccordionSummary aria-controls="expandable-list-content" id="expandable-list-header">
        {title}
      </AccordionSummary>

      <AccordionDetails sx={{ display: 'block', p: 0 }}>{children}</AccordionDetails>
    </Accordion>
  );
};

export default ExpandableListDivider;
