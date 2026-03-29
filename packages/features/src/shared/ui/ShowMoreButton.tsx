/* eslint-disable react/jsx-max-depth */
import { Action, Actions, Button, IndentationContainer } from '@experiments/components';

type TProps = {
  children: React.ReactNode;
  testid?: string;
  onClick: () => void;
};

const ShowMoreButton = ({ children, testid, onClick }: TProps) => {
  return (
    <IndentationContainer>
      <Actions toCenter>
        <Action>
          <Button color="gray" icon="more_horiz" testid={testid} onClick={onClick}>
            {children}
          </Button>
        </Action>
      </Actions>
    </IndentationContainer>
  );
};

export default ShowMoreButton;
