import { Fab, LayoutContent, ToggleMenu } from '@experiments/components';
import { useBoolean } from '@experiments/hooks';
import { useCallback } from 'react';

import { EmojiPicker, Form, PollForm } from './components';
import { formatMessage, messagesDescriptors } from '../../../shared/translations';

import type { TFields } from './components';

export type TProps = {
  getFields: () => TFields;
  onSendMessage: () => void;
  onSendPoll: () => void;
  isPollsEnabled?: boolean;
};

const View: React.FC<TProps> = ({ getFields, onSendMessage, onSendPoll, isPollsEnabled }) => {
  const [isPollOpen, , setPollOpen, resetPollOpen] = useBoolean(false);
  const [isEmojiPickerOpen, , setEmojiPickerOpen, resetEmojiPickerOpen] = useBoolean(false);
  const { getTextMessageField, applyToTextMessageField } = getFields();

  const handleSubmit = useCallback(() => {
    onSendPoll();
    resetPollOpen();
    resetEmojiPickerOpen();
  }, [onSendPoll, resetPollOpen, resetEmojiPickerOpen]);

  const handleSelect = useCallback(
    (value: string) => {
      resetEmojiPickerOpen();
      applyToTextMessageField(value);
    },
    [resetEmojiPickerOpen, applyToTextMessageField],
  );

  return (
    <Form getTextMessageField={getTextMessageField} onSend={onSendMessage}>
      {isPollsEnabled === true ? (
        <ToggleMenu
          offsetAlong={30}
          parentOpen={isPollOpen}
          placement="top-start"
          position="static"
          renderAnchor={({ toggle }) => {
            return (
              <Fab
                flat
                mini
                color="transparent"
                icon="add_chart"
                testid="modePoll"
                title={formatMessage(messagesDescriptors.chatAddPoll)}
                onClick={toggle}
              />
            );
          }}
          setParentOpen={setPollOpen}
          zoom="normal"
        >
          <LayoutContent column>
            <PollForm getFields={getFields} onSubmit={handleSubmit} />
          </LayoutContent>
        </ToggleMenu>
      ) : undefined}

      <ToggleMenu
        offsetAlong={30}
        parentOpen={isEmojiPickerOpen}
        placement="top-start"
        position="static"
        renderAnchor={({ toggle }) => {
          return (
            <Fab
              flat
              mini
              color="transparent"
              icon="emoji_emotions"
              testid="modeEmojiPicker"
              title={formatMessage(messagesDescriptors.chatSelectEmoji)}
              onClick={toggle}
            />
          );
        }}
        setParentOpen={setEmojiPickerOpen}
      >
        <EmojiPicker onSelect={handleSelect} />
      </ToggleMenu>
    </Form>
  );
};

export default View;
