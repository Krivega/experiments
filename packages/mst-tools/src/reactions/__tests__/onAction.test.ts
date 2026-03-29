/* eslint-disable no-param-reassign */
/// <reference types="jest" />
import { types } from 'mobx-state-tree';

import { onAction } from '../index';

describe('onAction', () => {
  it('calls the callback when the action name matches', () => {
    const mockCallback = jest.fn();
    const testModel = types
      .model({
        prop: types.string,
      })
      .actions((self) => {
        return {
          testAction(parameter: string) {
            self.prop = parameter;
          },
        };
      });
    const instance = testModel.create({ prop: '' });

    onAction(instance, mockCallback, {
      actionName: 'testAction',
    });

    instance.testAction('newValue');
    expect(mockCallback).toHaveBeenCalledWith('newValue');
  });

  it('calls the callback with undefined when action has no arguments', () => {
    const mockCallback = jest.fn();
    const testModel = types
      .model({
        prop: types.string,
      })
      .actions((self) => {
        return {
          actionWithoutArgs() {
            self.prop = 'updated';
          },
        };
      });

    const instance = testModel.create({ prop: '' });

    onAction(instance, mockCallback, {
      actionName: 'actionWithoutArgs',
    });

    instance.actionWithoutArgs();
    expect(mockCallback).toHaveBeenCalledWith(undefined);
  });

  it('does not call the callback when the action name does not match', () => {
    const mockCallback = jest.fn();
    const testModel = types
      .model({
        prop: types.string,
      })
      .actions((self) => {
        return {
          notMatchingAction(parameter: string) {
            self.prop = parameter;
          },
        };
      });
    const instance = testModel.create({ prop: '' });

    onAction(instance, mockCallback, {
      actionName: 'testAction',
    });

    instance.notMatchingAction('newValue');
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('calls the callback when the action name and targetPath match', () => {
    const mockCallback = jest.fn();
    const parentModel = types
      .model({
        child: types
          .model({
            prop: types.string,
          })
          .actions((self) => {
            return {
              childAction(parameter: string) {
                self.prop = parameter;
              },
            };
          }),
      })
      .actions((self) => {
        return {
          childAction(parameter: string) {
            self.child.childAction(parameter);
          },
        };
      });
    const instance = parentModel.create({ child: { prop: '' } });

    onAction(instance, mockCallback, {
      actionName: 'childAction',
      targetPath: '/child',
    });

    instance.child.childAction('newValue');
    expect(mockCallback).toHaveBeenCalledWith('newValue');
  });

  it('does not call the callback when the action name and targetPath not match', () => {
    const mockCallback = jest.fn();
    const parentModel = types
      .model({
        child: types
          .model({
            prop: types.string,
          })
          .actions((self) => {
            return {
              childAction(parameter: string) {
                self.prop = parameter;
              },
            };
          }),
      })
      .actions((self) => {
        return {
          childAction(parameter: string) {
            self.child.childAction(parameter);
          },
        };
      });
    const instance = parentModel.create({ child: { prop: '' } });

    onAction(instance, mockCallback, {
      actionName: 'childAction',
      targetPath: '/child',
    });

    instance.childAction('newValue');
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('does not call the callback when targetPath does not match', () => {
    const mockCallback = jest.fn();
    const parentModel = types
      .model({
        child: types.model({
          prop: types.string,
        }),
      })
      .actions((self) => {
        return {
          childAction(parameter: string) {
            self.child.prop = parameter;
          },
        };
      });
    const instance = parentModel.create({ child: { prop: '' } });

    onAction(instance, mockCallback, {
      actionName: 'childAction',
      targetPath: '/nonExistentPath',
    });

    instance.childAction('newValue');
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('calls the callback when the action is on the root and isRootPath is true', () => {
    const mockCallback = jest.fn();

    const childModel = types
      .model({
        prop: types.string,
      })
      .actions((self) => {
        return {
          childAction(parameter: string) {
            self.prop = parameter;
          },
        };
      });

    const rootModel = types
      .model({
        prop: types.string,
        child: childModel,
      })
      .actions((self) => {
        return {
          rootAction(parameter: string) {
            self.prop = parameter;
          },
        };
      });

    const instance = rootModel.create({
      prop: '',
      child: { prop: '' },
    });

    onAction(instance, mockCallback, {
      actionName: 'rootAction',
      isRootPath: true,
    });

    instance.rootAction('newValue');
    expect(mockCallback).toHaveBeenCalledWith('newValue');

    // Reset mock history before next action
    mockCallback.mockReset();

    instance.child.childAction('ignoredValue');
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('does not call the callback when the action is not on the root and isRootPath is true', () => {
    const mockCallback = jest.fn();
    const rootModel = types
      .model({
        prop: types.string,
      })
      .actions((self) => {
        return {
          rootAction(parameter: string) {
            self.prop = parameter;
          },
        };
      });

    const childModel = types
      .model({
        prop: types.string,
      })
      .actions((self) => {
        return {
          childAction(parameter: string) {
            self.prop = parameter;
          },
        };
      });

    const parentModel = types.model({
      root: rootModel,
      child: childModel,
    });

    const instance = parentModel.create({
      root: { prop: '' },
      child: { prop: '' },
    });

    onAction(instance, mockCallback, {
      actionName: 'childAction',
      isRootPath: true,
    });

    instance.child.childAction('newValue');
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('calls the callback before action if isAttachAfter === false', () => {
    const mockCallback = jest.fn();
    const mockAction = jest.fn();
    const testModel = types
      .model({
        prop: types.string,
      })
      .actions(() => {
        return {
          testAction: mockAction,
        };
      });
    const instance = testModel.create({ prop: '' });

    onAction(instance, mockCallback, {
      actionName: 'testAction',
      isAttachAfter: false,
    });

    instance.testAction();

    expect(mockCallback).toHaveBeenCalledBefore(mockAction);
    expect(mockAction).toHaveBeenCalledAfter(mockCallback);
  });

  it('calls the action before callback if isAttachAfter === true', () => {
    const mockCallback = jest.fn();
    const mockAction = jest.fn();
    const testModel = types
      .model({
        prop: types.string,
      })
      .actions(() => {
        return {
          testAction: mockAction,
        };
      });
    const instance = testModel.create({ prop: '' });

    onAction(instance, mockCallback, {
      actionName: 'testAction',
      isAttachAfter: true,
    });

    instance.testAction();

    expect(mockAction).toHaveBeenCalledBefore(mockCallback);
    expect(mockCallback).toHaveBeenCalledAfter(mockAction);
  });
});
