import { LoaderCircle, WrapperLoader } from '@experiments/components';

const ListItemLoader = ({ testId }: { testId: string }) => {
  return (
    <WrapperLoader flex>
      <LoaderCircle active size="small" testid={testId} />
    </WrapperLoader>
  );
};

export default ListItemLoader;
