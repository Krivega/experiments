import ContentCopy from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useCallback, useState } from 'react';

import type { FC } from 'react';

export type TCopyTextActionProps = {
  copiedMessage: string;
  copyTextTitle: string;
  decodedText: string;
  testidCopyTextButton: string;
};

const CopyTextAction: FC<TCopyTextActionProps> = ({
  copiedMessage,
  copyTextTitle,
  decodedText,
  testidCopyTextButton,
}) => {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(decodedText)
      .then(() => {
        setShowCopied(true);
        window.setTimeout(() => {
          setShowCopied(false);
        }, 2000);
      })
      .catch(() => {});
  }, [decodedText]);

  return (
    <Tooltip title={showCopied ? copiedMessage : copyTextTitle}>
      <IconButton
        aria-label={copyTextTitle}
        data-testid={testidCopyTextButton}
        title={copyTextTitle}
        onClick={handleCopy}
      >
        <ContentCopy fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default CopyTextAction;
