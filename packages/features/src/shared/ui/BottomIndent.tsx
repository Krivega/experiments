import { IndentationContainer } from '@experiments/components';

const BottomIndent = ({ children }: React.PropsWithChildren) => {
  return (
    <IndentationContainer left={false} right={false} top={false}>
      {children}
    </IndentationContainer>
  );
};

export default BottomIndent;
