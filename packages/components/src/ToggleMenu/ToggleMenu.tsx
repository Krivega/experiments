import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import { useCallback, useId, useState } from 'react';

import type { FC, PropsWithChildren, ReactNode } from 'react';

export type TRenderAnchorArgs = {
  isActive: boolean;
  toggle: () => void;
};

export type TToggleMenuProps = {
  offsetAlong?: number;
  parentOpen?: boolean;
  placement?: string;
  position?: string;
  renderAnchor: (args: TRenderAnchorArgs) => ReactNode;
  setParentOpen?: (open: boolean) => void;
  /** Accepted for API compatibility; not used visually. */
  zoom?: string;
};

const placementToOrigins = (placement: string | undefined) => {
  if (placement === 'top-start') {
    return {
      anchorOrigin: { horizontal: 'left' as const, vertical: 'top' as const },
      transformOrigin: { horizontal: 'left' as const, vertical: 'bottom' as const },
    };
  }

  return {
    anchorOrigin: { horizontal: 'left' as const, vertical: 'bottom' as const },
    transformOrigin: { horizontal: 'left' as const, vertical: 'top' as const },
  };
};

const ToggleMenu: FC<PropsWithChildren<TToggleMenuProps>> = ({
  children,
  offsetAlong,
  parentOpen,
  placement,
  position,
  renderAnchor,
  setParentOpen,
  zoom: _zoom,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = setParentOpen !== undefined;
  const open = isControlled ? (parentOpen ?? false) : internalOpen;
  const [anchorElement, setAnchorElement] = useState<HTMLDivElement | undefined>(undefined);
  const labelId = useId();

  const setOpen = useCallback(
    (next: boolean) => {
      if (setParentOpen) {
        setParentOpen(next);
      } else {
        setInternalOpen(next);
      }
    },
    [setParentOpen],
  );

  const toggle = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const { anchorOrigin, transformOrigin } = placementToOrigins(placement);

  const paperMarginTop = offsetAlong === undefined ? undefined : `${-offsetAlong / 8}px`;

  return (
    <>
      <Box
        aria-labelledby={labelId}
        ref={setAnchorElement}
        sx={{
          display: 'inline-flex',
          position: position === 'static' ? 'static' : 'relative',
        }}
      >
        {renderAnchor({ isActive: open, toggle })}
      </Box>

      <Popover
        anchorEl={anchorElement}
        anchorOrigin={anchorOrigin}
        open={open}
        slotProps={{
          paper: {
            sx: {
              mt: paperMarginTop,
            },
          },
        }}
        transformOrigin={transformOrigin}
        onClose={handleClose}
      >
        <Box id={labelId}>{children}</Box>
      </Popover>
    </>
  );
};

export default ToggleMenu;
