import { LoaderCircle } from '@experiments/components';

type TProps = {
  testId?: string;
};

const SavingLoader = ({ testId }: TProps) => {
  return <LoaderCircle active backdrop alignment="center" size="large" testid={testId} />;
};

export default SavingLoader;
