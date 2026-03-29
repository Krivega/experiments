import { Button, Text } from '@experiments/components';

export const ComponentsDemo = () => {
  return (
    <>
      <Text type="heading-secondary">@experiments/components</Text>

      <Button color="gray" testid="demo-components-button" onClick={() => {}}>
        Пример кнопки
      </Button>
    </>
  );
};
