import { observer } from 'mobx-react';

type TProps = {
  hasLoader?: () => boolean;
  hasNoContent: () => boolean;
  loader?: React.ReactNode;
  content: React.ReactNode;
};

const ContentRouter = ({
  hasLoader = () => {
    return false;
  },
  hasNoContent,
  loader,
  content,
}: TProps): React.ReactNode => {
  if (hasLoader()) {
    return loader;
  }

  if (hasNoContent()) {
    return undefined;
  }

  return content;
};

export default observer(ContentRouter);
