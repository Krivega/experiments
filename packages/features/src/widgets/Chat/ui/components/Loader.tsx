import { AlignContainer } from '@experiments/components';

import { Loader as LoaderUI } from '@/shared/ui';
import testIds from './testIds';

const Loader = () => {
  return (
    <AlignContainer fullHeight horizontal="center" vertical="center">
      <LoaderUI testId={testIds.loader} />
    </AlignContainer>
  );
};

export default Loader;
