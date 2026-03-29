import { LoaderCircle, WrapperLoaderCircle } from '@experiments/components';

type TProps = {
  testId?: string;
};

const Loader: React.FC<TProps> = ({ testId }) => {
  return (
    <WrapperLoaderCircle large>
      <LoaderCircle active alignment="center" size="large" testid={testId} />
    </WrapperLoaderCircle>
  );
};

export default Loader;
