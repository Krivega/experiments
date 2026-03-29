import { observer } from 'mobx-react';

import { CountUnreadMessages } from './components';

export type TProps = {
  getCountUnreadMessages: () => number;
  hasUnreadMessages: () => boolean;
};

const ViewChatCountUnreadMessages: React.FC<TProps> = ({
  getCountUnreadMessages,
  hasUnreadMessages,
}) => {
  if (hasUnreadMessages()) {
    return <CountUnreadMessages getCountUnreadMessages={getCountUnreadMessages} />;
  }

  return undefined;
};

export default observer(ViewChatCountUnreadMessages);
