export const emotions = {
  clap: { staticSource: '👏' },
  fire: { staticSource: '🔥' },
  grinning: { staticSource: '😀' },
  heart: { staticSource: '❤️' },
  joy: { staticSource: '😂' },
  thumbsUp: { staticSource: '👍' },
} as const;

export type TEmotion = keyof typeof emotions;
