import Addchart from '@mui/icons-material/Addchart';
import Delete from '@mui/icons-material/Delete';
import DeleteForever from '@mui/icons-material/DeleteForever';
import EmojiEmotions from '@mui/icons-material/EmojiEmotions';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import SpeakerNotesOff from '@mui/icons-material/SpeakerNotesOff';

export const ICON_COMPONENTS = {
  add_chart: Addchart,
  delete: Delete,
  delete_forever: DeleteForever,
  emoji_emotions: EmojiEmotions,
  more_horiz: MoreHoriz,
  speaker_notes_off: SpeakerNotesOff,
} as const;

export type TIconName = keyof typeof ICON_COMPONENTS;
