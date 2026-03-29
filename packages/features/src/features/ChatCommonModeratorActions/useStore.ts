import { useMemo } from 'react';

import { createStore } from './store';

import type { ICoreApi, IServerApi } from './store';

type TProps = {
  serverApi: IServerApi;
  coreApi: ICoreApi;
};

const useStore = (props: TProps) => {
  return useMemo(() => {
    return createStore(props);
  }, [props]);
};

export default useStore;
