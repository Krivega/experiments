import type { TProps as TPropsViewCommonModeratorActions } from './ViewCommonModeratorActions';
import type { TProps as TPropsViewEnableChat } from './ViewEnableChat';

export { testIds } from './components';
export { default as ViewCommonModeratorActions } from './ViewCommonModeratorActions';
export { default as ViewEnableChat } from './ViewEnableChat';

export type TPropsView = TPropsViewCommonModeratorActions & TPropsViewEnableChat;
