import Box from '@mui/material/Box';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import type { PropsWithChildren } from 'react';

export type TMessageListScrollHandle = {
  scrollToBottom: () => void;
};

export type TMessageListProps = {
  testid?: string;
};

const MessageList = forwardRef<TMessageListScrollHandle, PropsWithChildren<TMessageListProps>>(
  ({ children, testid }, reference) => {
    const innerReference = useRef<HTMLDivElement>(null);

    useImperativeHandle(reference, () => {
      return {
        scrollToBottom: () => {
          const element = innerReference.current;

          if (element) {
            element.scrollTop = element.scrollHeight;
          }
        },
      };
    });

    return (
      <Box
        data-testid={testid}
        ref={innerReference}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100%',
          overflow: 'auto',
          width: '100%',
        }}
      >
        {children}
      </Box>
    );
  },
);

MessageList.displayName = 'MessageList';

export default MessageList;
