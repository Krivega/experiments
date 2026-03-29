import type messagesDescriptors from './messagesDescriptors';
import type translations from './translations';

export type TLanguage = keyof typeof translations;
export type TMessageDescriptor = keyof typeof messagesDescriptors;
