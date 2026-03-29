import { ExpandableListDivider, List, Text } from '@experiments/components';

import NoSearchMatches from './NoSearchMatches';
import { formatMessage, messagesDescriptors } from '../../translations';
import ShowMoreButton from '../ShowMoreButton';

type TProps = {
  title: string;
  countInTitle: number;
  isActive: boolean;
  isVisibleShowMore: boolean;
  isVisibleNoSearchMatches: boolean;
  testIdTitle: string;
  testIdList: string;
  testIdNoSearchMatches: string;
  children: React.ReactNode;
  onClickMore: () => void;
};

const ExpandableList = ({
  title,
  countInTitle,
  isActive,
  isVisibleShowMore,
  isVisibleNoSearchMatches,
  testIdTitle,
  testIdList,
  testIdNoSearchMatches,
  children,
  onClickMore,
}: TProps) => {
  const titleWithCount = `${title} (${countInTitle})`;

  const titleElement = (
    <Text dataValue={countInTitle} testid={testIdTitle} type="inherit">
      {titleWithCount}
    </Text>
  );

  return (
    <ExpandableListDivider active={isActive} title={titleElement}>
      <List compact testid={testIdList}>
        {children}
      </List>

      {isVisibleNoSearchMatches ? <NoSearchMatches testid={testIdNoSearchMatches} /> : undefined}

      {isVisibleShowMore ? (
        <ShowMoreButton onClick={onClickMore}>
          {formatMessage(messagesDescriptors.showMore)}
        </ShowMoreButton>
      ) : undefined}
    </ExpandableListDivider>
  );
};

export default ExpandableList;
