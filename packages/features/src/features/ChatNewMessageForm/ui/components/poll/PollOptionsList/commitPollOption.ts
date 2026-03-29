import type { TPollFields } from '../../types';

type TCommitParams = {
  value: string;
  fields: TPollFields;
  options: string[];
  setValue: (v: string) => void;
};

export const commitPollOption = ({ value, fields, options, setValue }: TCommitParams): void => {
  const trimmed = value.trim();

  if (trimmed === '') {
    return;
  }

  const newIndex = options.length;

  fields.addPollOption();
  fields.setPollOption(newIndex, trimmed);
  setValue('');
};
