import { AsideHeader, Heading } from '@experiments/components';

import testIds from './testIds';
import { formatMessage, messagesDescriptors } from '../../../../shared/translations';

type TProps = {
  children: React.ReactNode;
};

const Header: React.FC<TProps> = ({ children }) => {
  return (
    <AsideHeader>
      <Heading testid={testIds.title} type="body1">
        {formatMessage(messagesDescriptors.chat)}
      </Heading>

      {children}
    </AsideHeader>
  );
};

export default Header;
