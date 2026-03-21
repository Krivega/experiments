export type TTone =
  | '.'
  | '@'
  | '*'
  | '#'
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9';

export type TTones = Record<TTone, [number, number]>;

export type TAudioPlayer = {
  play: () => Promise<void>;
  stop: () => Promise<void>;
  setVolume: (volumeLevel: number) => void;
};

export type TCreateAudioPLayer = (parameters: {
  url: string;
  sinkId: string | undefined;
  loop?: boolean;
  volume?: number;
}) => TAudioPlayer;

export type TAnalyser = {
  getDataArray: () => Uint8Array;
  resume: () => Promise<void>;
  destroy: () => Promise<void>;
};
