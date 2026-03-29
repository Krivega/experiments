import { actionsMessagesDescriptors } from './actions';
import { errorsMessagesDescriptors } from './errors';
import { labelsMessagesDescriptors } from './labels';

const exampleMessagesDescriptors = {
  failedExample: { id: 'failedExample' },
  warningExample: { id: 'warningExample' },
  successExample: { id: 'successExample' },
  infoExample: { id: 'infoExample' },
};

const messagesDescriptors = {
  ...actionsMessagesDescriptors,
  ...labelsMessagesDescriptors,
  ...errorsMessagesDescriptors,
  ...exampleMessagesDescriptors,
};

export default messagesDescriptors;
