type TDestroy = () => void;

export interface IPresenter<T> {
  getPropsView: () => T;
  init: () => TDestroy;
}
