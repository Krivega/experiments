import { Caption, IndentationContainer } from '@experiments/components';

import { formatMessage, messagesDescriptors } from '../../translations';

const NoSearchMatches = ({ testid }: { testid: string }) => {
  return (
    <IndentationContainer>
      <Caption nowrap={false} testid={testid}>
        {formatMessage(messagesDescriptors.noSearchMatches)}
      </Caption>
    </IndentationContainer>
  );
};

export default NoSearchMatches;
