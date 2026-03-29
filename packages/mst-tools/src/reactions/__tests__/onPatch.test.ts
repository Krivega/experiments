/* eslint-disable no-param-reassign */
/// <reference types="jest" />
import { types } from 'mobx-state-tree';

import { onPatch } from '../index';

describe('onPatch', () => {
  it('calls the callback when operationName and pathRegExp match', () => {
    const mockCallback = jest.fn();
    const testModel = types
      .model({
        prop: types.string,
      })
      .actions((self) => {
        return {
          update(parameter: string) {
            self.prop = parameter;
          },
        };
      });

    const instance = testModel.create({ prop: '' });

    onPatch(instance, mockCallback, {
      operationName: 'replace',
      pathRegExp: '/prop',
    });

    instance.update('test');

    expect(mockCallback).toHaveBeenCalledWith('test');
  });

  it('does not call the callback when operationName does not match', () => {
    const mockCallback = jest.fn();
    const testModel = types
      .model({
        prop: types.string,
      })
      .actions((self) => {
        return {
          update(parameter: string) {
            self.prop = parameter;
          },
        };
      });

    const instance = testModel.create({ prop: '' });

    onPatch(instance, mockCallback, {
      operationName: 'add',
      pathRegExp: '/prop',
    });

    instance.update('test');

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('does not call the callback when pathRegExp does not match', () => {
    const mockCallback = jest.fn();
    const testModel = types
      .model({
        prop: types.string,
      })
      .actions((self) => {
        return {
          update(parameter: string) {
            self.prop = parameter;
          },
        };
      });

    const instance = testModel.create({ prop: '' });

    onPatch(instance, mockCallback, {
      operationName: 'replace',
      pathRegExp: '/other',
    });

    instance.update('test');

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('call the callback when operationName and pathRegExp match with parent model', () => {
    const mockCallback = jest.fn();
    const childModel = types
      .model({
        prop: types.string,
      })
      .actions((self) => {
        return {
          update(parameter: string) {
            self.prop = parameter;
          },
        };
      });

    const parentModel = types
      .model({
        prop: types.string,
        child: childModel,
      })
      .actions((self) => {
        return {
          update(parameter: string) {
            self.prop = parameter;
          },
        };
      });

    const instance = parentModel.create({ prop: '', child: { prop: '' } });

    onPatch(instance, mockCallback, {
      operationName: 'replace',
      pathRegExp: '^/prop+$',
    });

    instance.child.update('test');

    expect(mockCallback).toHaveBeenCalledTimes(0);

    instance.update('test');

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith('test');
  });

  it('call the callback when operationName and pathRegExp match with child model', () => {
    const mockCallback = jest.fn();
    const childModel = types
      .model({
        prop: types.string,
      })
      .actions((self) => {
        return {
          update(parameter: string) {
            self.prop = parameter;
          },
        };
      });

    const parentModel = types
      .model({
        prop: types.string,
        child: childModel,
      })
      .actions((self) => {
        return {
          update(parameter: string) {
            self.prop = parameter;
          },
        };
      });

    const instance = parentModel.create({ prop: '', child: { prop: '' } });

    onPatch(instance, mockCallback, {
      operationName: 'replace',
      pathRegExp: '^/child/prop+$',
    });

    instance.update('test');

    expect(mockCallback).toHaveBeenCalledTimes(0);

    instance.child.update('test');

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith('test');
  });
});
