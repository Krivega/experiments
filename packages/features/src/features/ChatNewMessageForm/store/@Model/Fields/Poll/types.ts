import type { TPollMode } from '@/shared/voteEncoding';

export type TPollState = {
  pollQuestion: string;
  pollOptions: string[];
  pollMode: TPollMode;
};
