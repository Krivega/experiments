import { IndentationContainer, FieldBox } from '@experiments/components';

type TProps = React.PropsWithChildren<{
  top?: boolean;
  bottom?: boolean;
}>;

const FieldsIndentationBlock = ({ children, top = false, bottom = false }: TProps) => {
  return (
    <IndentationContainer bottom={bottom} left={false} right={false} top={top}>
      <FieldBox>{children}</FieldBox>
    </IndentationContainer>
  );
};

export default FieldsIndentationBlock;
