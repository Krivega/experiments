import { NavBadge } from '@experiments/components';
import { observer } from 'mobx-react';

import { getLimitedCount } from './actions';
import testIds from './testIds';

type TProps = {
  getCountUnreadMessages: () => number;
};

const CountUnreadMessages: React.FC<TProps> = ({ getCountUnreadMessages }) => {
  const count = getCountUnreadMessages();
  const limitedCount = getLimitedCount(count);

  return <NavBadge testid={testIds.countUnreadMessages}>{limitedCount}</NavBadge>;
};

export default observer(CountUnreadMessages);
