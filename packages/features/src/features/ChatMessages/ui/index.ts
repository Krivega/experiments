import type { TProps as TPropsViewChatCountUnreadMessages } from './ViewChatCountUnreadMessages';
import type { TProps as TPropsViewChatMessagesList } from './ViewChatMessagesList';

export type { TFeedItem } from './components';

export { testIds } from './components';
export { default as ViewChatCountUnreadMessages } from './ViewChatCountUnreadMessages';
export { default as ViewChatMessagesList } from './ViewChatMessagesList';

export type TPropsView = TPropsViewChatCountUnreadMessages & TPropsViewChatMessagesList;
