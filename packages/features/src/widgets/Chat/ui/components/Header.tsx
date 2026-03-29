import { AsideHeader, Heading } from '@experiments/components';

import { formatMessage, messagesDescriptors } from '@/shared/translations';
import testIds from './testIds';

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
