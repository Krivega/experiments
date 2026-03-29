import { EmojiPickerFull as EmojiPickerComponent, emotions } from '@experiments/components';
import { observer } from 'mobx-react';

import type { TEmotion } from '@experiments/components';

export type TProps = {
  onSelect: (value: string) => void;
};

const EmojiPicker: React.FC<TProps> = ({ onSelect }) => {
  const handleSelectEmoji = (emoji: TEmotion) => {
    onSelect(emotions[emoji].staticSource);
  };

  return <EmojiPickerComponent testid="emojiPicker" onSelect={handleSelectEmoji} />;
};

export default observer(EmojiPicker);
