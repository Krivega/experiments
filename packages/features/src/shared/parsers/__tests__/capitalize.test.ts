/// <reference types="jest" />
import capitalize from '../capitalize';

describe('capitalize', () => {
  it('возвращает пустую строку для пустой строки', () => {
    expect(capitalize('')).toBe('');
  });

  it('обрабатывает один символ', () => {
    expect(capitalize('a')).toBe('A');
  });

  it('делает первую букву заглавной', () => {
    expect(capitalize('hello world')).toBe('Hello world');
  });

  it('оставляет уже заглавную букву', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });
});
