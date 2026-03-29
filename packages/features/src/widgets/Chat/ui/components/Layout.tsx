import { observer } from 'mobx-react';

import Header from './Header';

type TProps = {
  ModeratorActions: React.ComponentType;
  hasEnabledModeratorActions: () => boolean;
  children: React.ReactNode;
};

const Layout: React.FC<TProps> = ({ ModeratorActions, hasEnabledModeratorActions, children }) => {
  return (
    <>
      <Header>{hasEnabledModeratorActions() ? <ModeratorActions /> : undefined}</Header>

      {children}
    </>
  );
};

export default observer(Layout);
