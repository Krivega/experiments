import type { IBaseComposition, IFeatureExport } from '@experiments/framework';

export type TChatMessagesListComposition = IBaseComposition;
export type TCommonModeratorActionsComposition = IBaseComposition;
export type TEnableChatActionComposition = IBaseComposition;
export type TChatCountUnreadMessagesComposition = IBaseComposition;
export type TChatNewMessageFormComposition = IBaseComposition & {
  isPollsEnabled?: boolean;
};

export type TFeatures = {
  chatMessagesList: IFeatureExport<TChatMessagesListComposition>;
  commonModeratorActions: IFeatureExport<TCommonModeratorActionsComposition>;
  enableChatAction: IFeatureExport<TEnableChatActionComposition>;
  chatNewMessageForm: IFeatureExport<TChatNewMessageFormComposition>;
  chatCountUnreadMessages: IFeatureExport<TChatCountUnreadMessagesComposition>;
};

export type TComposition = {
  ChatMessagesList: React.ComponentType<Partial<TChatMessagesListComposition>>;
  CommonModeratorActions: React.ComponentType<Partial<TCommonModeratorActionsComposition>>;
  EnableChatAction: React.ComponentType<Partial<TEnableChatActionComposition>>;
  ChatNewMessageForm: React.ComponentType<Partial<TChatNewMessageFormComposition>>;
  ChatCountUnreadMessages: React.ComponentType<Partial<TChatCountUnreadMessagesComposition>>;
};
