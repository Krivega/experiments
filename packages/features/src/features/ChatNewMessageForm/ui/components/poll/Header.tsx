import { Text, Divider } from '@experiments/components';

import { formatMessage, messagesDescriptors } from '../../../../../shared/translations';

const Header = () => {
  return (
    <>
      <Text centered color="on-secondary">
        {formatMessage(messagesDescriptors.pollLabel)}
      </Text>

      <Divider paddingBig />
    </>
  );
};

export default Header;
