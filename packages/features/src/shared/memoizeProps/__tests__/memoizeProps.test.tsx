/* eslint-disable unicorn/no-null */

import { render } from '@testing-library/react';
import React from 'react';

import memoizeProps from '../memoizeProps';

import type { TMemoizedComponent } from '../types';

describe('memoizeProps', () => {
  type TProps = {
    items: string[];
    filter?: string;
  };

  const renderSpy = jest.fn();

  const Component: React.FC<TProps> = (props) => {
    renderSpy(props);

    return <div />;
  };

  it('должен считать массивы с одинаковым составом элементов в разном порядке равными', () => {
    const memoized = memoizeProps(Component, { arrays: ['items'] }) as TMemoizedComponent<TProps>;
    const compare = memoized.compare as (prevProps: TProps, nextProps: TProps) => boolean;

    const prevProps: TProps = { items: ['one', 'two'] };
    const nextProps: TProps = { items: ['two', 'one'] };

    expect(compare(prevProps, nextProps)).toBe(true);
  });

  it('должен считать массивы неравными при добавлении элемента', () => {
    const memoized = memoizeProps(Component, { arrays: ['items'] }) as TMemoizedComponent<TProps>;
    const compare = memoized.compare as (prevProps: TProps, nextProps: TProps) => boolean;

    const prevProps: TProps = { items: ['one', 'two'] };
    const nextProps: TProps = { items: ['one', 'two', 'three'] };

    expect(compare(prevProps, nextProps)).toBe(false);
  });

  it('должен считать массивы неравными при удалении элемента', () => {
    const memoized = memoizeProps(Component, { arrays: ['items'] }) as TMemoizedComponent<TProps>;
    const compare = memoized.compare as (prevProps: TProps, nextProps: TProps) => boolean;

    const prevProps: TProps = { items: ['one', 'two', 'three'] };
    const nextProps: TProps = { items: ['one', 'two'] };

    expect(compare(prevProps, nextProps)).toBe(false);
  });

  it('должен считать массивы с одним заменённым элементом неравными', () => {
    const memoized = memoizeProps(Component, { arrays: ['items'] }) as TMemoizedComponent<TProps>;
    const compare = memoized.compare as (prevProps: TProps, nextProps: TProps) => boolean;

    const prevProps: TProps = { items: ['one', 'two'] };
    const nextProps: TProps = { items: ['one', 'three'] };

    expect(compare(prevProps, nextProps)).toBe(false);
  });

  it('должен использовать переданный предикат', () => {
    const predicate = jest.fn(() => {
      return true;
    });

    const memoized = memoizeProps(Component, predicate) as TMemoizedComponent<TProps>;

    expect(memoized.compare).toBe(predicate);

    const prevProps: TProps = { items: ['one'] };
    const nextProps: TProps = { items: ['one'] };

    memoized.compare?.(prevProps, nextProps);

    expect(predicate).toHaveBeenCalledWith(prevProps, nextProps);
  });

  it('должен сравнивать пропсы из конфига strictEqual по строгому равенству', () => {
    const memoized = memoizeProps(Component, {
      arrays: ['items'],
      strictEqual: ['filter'],
    }) as TMemoizedComponent<TProps>;
    const compare = memoized.compare as (prevProps: TProps, nextProps: TProps) => boolean;

    expect(compare({ items: ['one'], filter: 'a' }, { items: ['one'], filter: 'a' })).toBe(true);
    expect(compare({ items: ['one'], filter: 'a' }, { items: ['one'], filter: 'b' })).toBe(false);
  });

  it('должен считать равными undefined и null по строгому сравнению', () => {
    const memoized = memoizeProps(Component, { arrays: ['items'] }) as TMemoizedComponent<TProps>;
    const compare = memoized.compare as (
      prevProps: Record<string, unknown>,
      nextProps: Record<string, unknown>,
    ) => boolean;

    expect(compare({ items: undefined }, { items: undefined })).toBe(true);
    expect(compare({ items: null }, { items: null })).toBe(true);
    expect(compare({ items: undefined }, { items: null })).toBe(false);
    expect(compare({ items: undefined }, { items: ['one'] })).toBe(false);
    expect(compare({ items: null }, { items: ['one'] })).toBe(false);
  });

  it('не должен вызывать повторный рендер, если длина и состав массивов не изменились', () => {
    const Memoized = memoizeProps(Component, { arrays: ['items'] });

    const { rerender } = render(<Memoized items={['one', 'two']} />);

    rerender(<Memoized items={['one', 'two']} />);

    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it('должен считать неравными массив и null, undefined', () => {
    const memoized = memoizeProps(Component, { arrays: ['items'] }) as TMemoizedComponent<TProps>;
    const compare = memoized.compare as (
      prevProps: Record<string, unknown>,
      nextProps: Record<string, unknown>,
    ) => boolean;

    expect(compare({ items: ['one', 'two'] }, { items: undefined })).toBe(false);
    expect(compare({ items: ['one', 'two'] }, { items: null })).toBe(false);
  });

  it('должен игнорировать изменение пропсов, не входящих в arrays и strictEqual', () => {
    type TPropsWithExtra = TProps & { onCallback?: () => void };

    const memoized = memoizeProps(Component, {
      arrays: ['items'],
      strictEqual: ['filter'],
    }) as TMemoizedComponent<TPropsWithExtra>;
    const compare = memoized.compare as (
      prevProps: TPropsWithExtra,
      nextProps: TPropsWithExtra,
    ) => boolean;

    const prevProps: TPropsWithExtra = { items: ['one'], filter: 'a', onCallback: () => {} };
    const nextProps: TPropsWithExtra = { items: ['one'], filter: 'a', onCallback: () => {} };

    expect(compare(prevProps, nextProps)).toBe(true);
  });

  it('должен сравнивать массивы по ссылке при пустом конфиге arrays', () => {
    const memoized = memoizeProps(Component, {}) as TMemoizedComponent<TProps>;
    const compare = memoized.compare as (prevProps: TProps, nextProps: TProps) => boolean;

    const sharedArray = ['one', 'two'];

    expect(compare({ items: ['one', 'two'] }, { items: ['one', 'two'] })).toBe(false);
    expect(compare({ items: sharedArray }, { items: sharedArray })).toBe(true);
  });
});
