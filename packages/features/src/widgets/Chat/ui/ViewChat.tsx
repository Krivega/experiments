import { Content, Layout, Loader } from './components';
import { ContentRouter } from '../../../shared/ui';

import type { TFeatures } from './types';

export type TPropsView = {
  hasNoContent: () => boolean;
  hasNotAvailable: () => boolean;
  hasLoading: () => boolean;
  hasBanned: () => boolean;
  hasModerator: () => boolean;
  hasEnabledModeratorActions: () => boolean;
};

type TProps = {
  features: TFeatures;
};

const ViewChat: React.FC<TProps & TPropsView> = ({
  features,
  hasNoContent,
  hasNotAvailable,
  hasLoading,
  hasBanned,
  hasModerator,
  hasEnabledModeratorActions,
}) => {
  const { ChatMessagesList, ChatNewMessageForm, CommonModeratorActions, EnableChatAction } =
    features;

  return (
    <Layout
      ModeratorActions={CommonModeratorActions}
      hasEnabledModeratorActions={hasEnabledModeratorActions}
    >
      <ContentRouter
        content={
          <Content
            EnableChatAction={EnableChatAction}
            MessagesList={ChatMessagesList}
            NewMessageForm={ChatNewMessageForm}
            hasBanned={hasBanned}
            hasModerator={hasModerator}
            hasNotAvailable={hasNotAvailable}
          />
        }
        hasLoader={hasLoading}
        hasNoContent={hasNoContent}
        loader={<Loader />}
      />
    </Layout>
  );
};

export default ViewChat;
