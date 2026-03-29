import { decodeUriExceptSpace } from '@/shared/parsers';
import { parseMessageText } from '@/shared/voteEncoding';
import Model from '../Model';

import type { TParsedPoll } from '@/shared/voteEncoding';
import type { TInstance } from '../Model';

jest.mock('@/shared/voteEncoding', () => {
  return {
    parseMessageText: jest.fn(),
  };
});

jest.mock('@/shared/parsers', () => {
  return {
    decodeUriExceptSpace: jest.fn(),
  };
});

const mockMessage = {
  id: 'id1',
  my: false,
  isRead: false,
  text: 'Text',
  timestamp: 1000,
  title: 'Author',
};

describe('Модель сообщения', () => {
  let instance: TInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    instance = Model.create(mockMessage);
  });

  it('должен создаваться с начальными значениями', () => {
    expect(instance.isRead).toBe(false);
    expect(instance.isDeletable).toBe(false);
    expect(instance.text).toBe('Text');
    expect(instance.timestamp).toBe(1000);
    expect(instance.title).toBe('Author');
    expect(instance.id).toBe('id1');
    expect(instance.my).toBe(false);
  });

  it('isDeletable должен быть true, если my равен true', () => {
    instance = Model.create({ ...mockMessage, my: true });

    expect(instance.my).toBe(true);
    expect(instance.isDeletable).toBe(true);
  });

  it('markAsRead должен помечать сообщение как прочитанное', () => {
    instance.markAsRead();

    expect(instance.isRead).toBe(true);
  });

  it('parsedMessage должен возвращать plain сообщение с декодированным текстом и мета-данными', () => {
    const parseMessageTextMock = parseMessageText as jest.MockedFunction<typeof parseMessageText>;
    const decodeUriExceptSpaceMock = decodeUriExceptSpace as jest.MockedFunction<
      typeof decodeUriExceptSpace
    >;

    parseMessageTextMock.mockReturnValue({ type: 'plain' });

    decodeUriExceptSpaceMock.mockReturnValue('decoded text');

    const parsed = instance.parsedMessage;

    expect(parseMessageTextMock).toHaveBeenCalledWith(mockMessage.text);
    expect(decodeUriExceptSpaceMock).toHaveBeenCalledWith(mockMessage.text);

    expect(parsed).toMatchObject({
      type: 'plain',
      text: 'decoded text',
      id: mockMessage.id,
      timestamp: mockMessage.timestamp,
      isDeletable: false,
      isRead: mockMessage.isRead,
      isMy: mockMessage.my,
      author: mockMessage.title,
    });
  });

  it('parsedMessage должен возвращать poll с мета-данными без декодирования текста', () => {
    const parseMessageTextMock = parseMessageText as jest.MockedFunction<typeof parseMessageText>;
    const decodeUriExceptSpaceMock = decodeUriExceptSpace as jest.MockedFunction<
      typeof decodeUriExceptSpace
    >;

    const parsedPoll: TParsedPoll = {
      type: 'poll',
      pollId: 'poll-1',
      question: 'Question',
      options: ['a', 'b'],
      mode: 'single',
    };

    parseMessageTextMock.mockReturnValue(parsedPoll);

    const parsed = instance.parsedMessage;

    expect(parseMessageTextMock).toHaveBeenCalledWith(mockMessage.text);
    expect(decodeUriExceptSpaceMock).not.toHaveBeenCalled();

    expect(parsed).toMatchObject({
      ...parsedPoll,
      id: mockMessage.id,
      timestamp: mockMessage.timestamp,
      isDeletable: false,
      isRead: mockMessage.isRead,
      isMy: mockMessage.my,
      author: mockMessage.title,
    });
  });
});
