import { FieldBox, TitleOverline } from '@experiments/components';

import BottomIndent from './BottomIndent';

type TProps = React.PropsWithChildren<{
  title: string;
  isBackground?: boolean;
}>;

const SettingsSection = ({ title, children, isBackground = false }: TProps) => {
  return (
    <>
      <TitleOverline>{title}</TitleOverline>

      <BottomIndent>{isBackground ? <FieldBox>{children}</FieldBox> : children}</BottomIndent>
    </>
  );
};

export default SettingsSection;
