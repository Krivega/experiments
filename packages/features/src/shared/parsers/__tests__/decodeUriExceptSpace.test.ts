import decodeUriExceptSpace from '../decodeUriExceptSpace';

const complexEncodedString =
  'https://docs.yandex.ru/docs/view?url=ya-disk-public%3A%2F%2Fei3Gq%2FTuTIiStMULA3%2BYPLx5SHGDEJhYZgbFOeLkYXwbDK6qQCFAB9K8XxPRSpE5q%2FJ6bpmRyOJonT3VoXnDag%3D%3D%3A%2F%D0%9E%D0%B1%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5%20Vinteo%20.pdf&name=%D0%9E%D0%B1%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5%20Vinteo%20.pdf это ссылка на нашу доку';

const complexDecodedString =
  'https://docs.yandex.ru/docs/view?url=ya-disk-public%3A%2F%2Fei3Gq%2FTuTIiStMULA3%2BYPLx5SHGDEJhYZgbFOeLkYXwbDK6qQCFAB9K8XxPRSpE5q%2FJ6bpmRyOJonT3VoXnDag%3D%3D%3A%2FОбновление%20Vinteo%20.pdf&name=Обновление%20Vinteo%20.pdf это ссылка на нашу доку';

describe('decodeUriExceptSpace', () => {
  describe('успешное декодирование', () => {
    it('должен декодировать URI без влияния на "%20"', () => {
      expect(decodeUriExceptSpace('Hello%20World')).toBe('Hello%20World');
    });

    it('должен декодировать URI сохраняя "%20"', () => {
      expect(decodeUriExceptSpace('Hello%20World%21')).toBe('Hello%20World!');
    });

    it('должен декодировать другие закодированные символы', () => {
      expect(decodeUriExceptSpace('Hello%21')).toBe('Hello!');
    });

    it('должен обрабатывать множественные экземпляры "%20"', () => {
      expect(decodeUriExceptSpace('Hello%20World%20from%20Jest%21')).toBe(
        'Hello%20World%20from%20Jest!',
      );
    });

    it('должен обрабатывать пустую строку', () => {
      expect(decodeUriExceptSpace('')).toBe('');
    });

    it('должен обрабатывать сложную закодированную строку', () => {
      expect(decodeUriExceptSpace(complexEncodedString)).toBe(complexDecodedString);
    });
  });

  describe('ошибка декодирования', () => {
    it('должен возвращать оригинальный текст при некорректном URI', () => {
      const input = 'Hello%20World%GGTest%21';
      const expected = 'Hello%20World%GGTest%21';

      expect(decodeUriExceptSpace(input)).toBe(expected);
    });

    it('должен возвращать оригинальный текст при неполном URI', () => {
      const input = 'Hello%20World%';
      const expected = 'Hello%20World%';

      expect(decodeUriExceptSpace(input)).toBe(expected);
    });

    it('должен возвращать оригинальный текст при некорректном символе', () => {
      const input = 'Hello%20World%XX';
      const expected = 'Hello%20World%XX';

      expect(decodeUriExceptSpace(input)).toBe(expected);
    });
  });
});
