/* eslint-disable react/jsx-props-no-spreading */
import { usePresenter } from '@experiments/framework';

import { Presenter } from './presenter';
import { View } from './ui';
import useStore from './useStore';

type TStoreProps = Parameters<typeof useStore>[0];

type TProps = TStoreProps & {
  isPollsEnabled?: boolean;
};

const Main = ({ serverApi, isPollsEnabled }: TProps) => {
  const store = useStore({ serverApi });
  const propsView = usePresenter(Presenter, { store });

  return <View {...propsView} isPollsEnabled={isPollsEnabled} />;
};

export default Main;
