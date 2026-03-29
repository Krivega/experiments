import { AlignContainer } from '@experiments/components';

import testIds from './testIds';
import { Loader as LoaderUI } from '../../../../shared/ui';

const Loader = () => {
  return (
    <AlignContainer fullHeight horizontal="center" vertical="center">
      <LoaderUI testId={testIds.loader} />
    </AlignContainer>
  );
};

export default Loader;
