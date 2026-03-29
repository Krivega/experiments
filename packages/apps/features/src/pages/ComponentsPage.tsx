import { FieldBox, IndentationContainer } from '@experiments/components';

import { ComponentsDemo } from './ComponentsDemo';

const ComponentsPage = () => {
  return (
    <IndentationContainer bottom={false} left={false} right={false} top={false}>
      <FieldBox>
        <ComponentsDemo />
      </FieldBox>
    </IndentationContainer>
  );
};

export default ComponentsPage;
