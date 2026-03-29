import { useMemo } from 'react';

import { createStore, type IServerApi } from './store';

type TProps = {
  serverApi: IServerApi;
};

const useStore = ({ serverApi }: TProps) => {
  return useMemo(() => {
    return createStore({ serverApi, coreApi: undefined });
  }, [serverApi]);
};

export default useStore;
