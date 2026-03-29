import { IconButton, ToggleMenu } from '@experiments/components';

import testIds from './testIds';

type TProps = {
  children: React.ReactNode;
};

const Menu = ({ children }: TProps) => {
  return (
    <ToggleMenu
      renderAnchor={({ isActive, toggle }) => {
        return (
          <IconButton
            active={isActive}
            icon="more_horiz"
            testid={testIds.anchorChatHeader}
            onClick={toggle}
          />
        );
      }}
    >
      {children}
    </ToggleMenu>
  );
};

export default Menu;
