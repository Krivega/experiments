import type { TModelWithId } from '../types';

const stringArrayToCollectionMap = (array: string[]): TModelWithId[] => {
  return array.map((id: string) => {
    return { id };
  });
};

export default stringArrayToCollectionMap;
