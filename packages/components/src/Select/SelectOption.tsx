import MenuItem from '@mui/material/MenuItem';

import type { FC, PropsWithChildren } from 'react';

export type TSelectOptionProps = {
  value: string;
};

const SelectOption: FC<PropsWithChildren<TSelectOptionProps>> = ({ children, value }) => {
  return <MenuItem value={value}>{children}</MenuItem>;
};

export default SelectOption;
