/* eslint-disable react/jsx-max-depth -- message chrome layout */
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import Box from '@mui/material/Box';
import MuiIconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { FC, PropsWithChildren, ReactNode } from 'react';

export type TMessageProps = {
  author: string;
  avatar: ReactNode;
  date: string;
  deleteButton: boolean;
  deleteButtonTitle: string;
  renderCopyTextAction: () => ReactNode | undefined;
  showAvatar?: boolean;
  testidDeleteMessageIcon: string;
  testidMessageAuthor: string;
  testidMessageBody: string;
  testidMessageText: string;
  onDeleteClick: () => void;
};

const Message: FC<PropsWithChildren<TMessageProps>> = ({
  author,
  avatar,
  children,
  date,
  deleteButton,
  deleteButtonTitle,
  renderCopyTextAction,
  showAvatar,
  testidDeleteMessageIcon,
  testidMessageAuthor,
  testidMessageBody,
  testidMessageText,
  onDeleteClick,
}) => {
  const copyAction = renderCopyTextAction();

  return (
    <Stack alignItems="flex-start" direction="row" spacing={1} sx={{ py: 0.5 }}>
      {showAvatar === true ? <Box sx={{ flexShrink: 0 }}>{avatar}</Box> : undefined}

      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
        <Stack
          alignItems="flex-start"
          direction="row"
          justifyContent="space-between"
          spacing={1}
          sx={{ width: '100%' }}
        >
          <Typography
            data-testid={testidMessageAuthor}
            sx={{ wordBreak: 'break-word' }}
            variant="subtitle2"
          >
            {author}
          </Typography>

          <Stack alignItems="center" direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Typography color="text.secondary" variant="caption">
              {date}
            </Typography>

            {copyAction}

            {deleteButton ? (
              <MuiIconButton
                aria-label={deleteButtonTitle}
                data-testid={testidDeleteMessageIcon}
                size="small"
                title={deleteButtonTitle}
                onClick={onDeleteClick}
              >
                <DeleteOutline fontSize="small" />
              </MuiIconButton>
            ) : undefined}
          </Stack>
        </Stack>

        <Box data-testid={testidMessageBody}>
          <Typography component="div" data-testid={testidMessageText} variant="body2">
            {children}
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
};

export default Message;
