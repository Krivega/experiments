import { useEffect, useMemo } from 'react';

import type { BasePresenter } from './BasePresenter';
import type { IBaseStore, TErrorMessagesDefault } from './types';

export function usePresenter<
  TPropsView,
  TStore extends IBaseStore = IBaseStore,
  TPropsPresenter extends { store: TStore } = { store: TStore },
  TFields = unknown,
  TActions = unknown,
  TErrorMessages extends TErrorMessagesDefault = TErrorMessagesDefault,
>(
  PresenterClass: new (
    props: TPropsPresenter,
  ) => BasePresenter<TPropsView, TStore, TFields, TActions, TErrorMessages>,
  props: TPropsPresenter,
) {
  const presenter = useMemo(() => {
    return new PresenterClass(props);
    // Используем Object.values для избежания лишних перерендеров при передаче объекта пропсов
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PresenterClass, ...Object.values(props)]);

  useEffect(() => {
    return presenter.init();
  }, [presenter]);

  return useMemo(() => {
    return presenter.getPropsView();
  }, [presenter]);
}
