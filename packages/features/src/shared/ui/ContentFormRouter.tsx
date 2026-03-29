import { observer } from 'mobx-react';

const hasFalsy = () => {
  return false;
};

type TProps = {
  initialLoader: React.ReactNode;
  savingLoader: React.ReactNode;
  fields: React.ReactNode;
  noContent?: React.ReactNode;
  error?: React.ReactNode;
  hasInitialLoader: () => boolean;
  hasSavingLoader: () => boolean;
  hasNoContent?: () => boolean;
  hasError?: () => boolean;
};

const ContentFormRouter = ({
  hasNoContent = hasFalsy,
  hasError = hasFalsy,
  initialLoader,
  savingLoader,
  fields,
  noContent,
  error,
  hasInitialLoader,
  hasSavingLoader,
}: TProps): React.ReactNode => {
  if (hasInitialLoader()) {
    return initialLoader;
  }

  if (hasError()) {
    return error;
  }

  if (hasNoContent()) {
    return noContent;
  }

  if (hasSavingLoader()) {
    return (
      <>
        {fields}

        {savingLoader}
      </>
    );
  }

  return fields;
};

export default observer(ContentFormRouter);
