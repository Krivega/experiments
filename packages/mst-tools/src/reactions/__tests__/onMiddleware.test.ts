/* eslint-disable no-param-reassign */
/// <reference types="jest" />
import { types } from 'mobx-state-tree';

import { onMiddleware } from '../index';

describe('onMiddleware', () => {
  it('calls the callback when the action name and type matches', () => {
    const mockCallback = jest.fn();
    const testModel = types
      .model({
        prop: types.string,
      })
      .actions((self) => {
        return {
          childAction(parameter: string) {
            self.prop = parameter;
          },
          parentAction(parameter: string) {
            this.childAction(parameter);
          },
        };
      });
    const instance = testModel.create({ prop: '' });

    onMiddleware(instance, mockCallback, {
      actionName: 'childAction',
      type: 'action',
    });

    instance.parentAction('newValue');
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
          childActionWithoutArgs() {
            self.prop = 'updated';
          },
          parentActionWithoutArgs() {
            this.childActionWithoutArgs();
          },
        };
      });

    const instance = testModel.create({ prop: '' });

    onMiddleware(instance, mockCallback, {
      actionName: 'childActionWithoutArgs',
      type: 'action',
    });

    instance.parentActionWithoutArgs();
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
          childAction(parameter: string) {
            self.prop = parameter;
          },
          parentAction(parameter: string) {
            this.childAction(parameter);
          },
        };
      });
    const instance = testModel.create({ prop: '' });

    onMiddleware(instance, mockCallback, {
      actionName: 'incorrectChildActionName',
      type: 'action',
    });

    instance.parentAction('newValue');
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('does not call the callback when the action type does not match', () => {
    const mockCallback = jest.fn();
    const testModel = types
      .model({
        prop: types.string,
      })
      .actions((self) => {
        return {
          childAction(parameter: string) {
            self.prop = parameter;
          },
          parentAction(parameter: string) {
            this.childAction(parameter);
          },
        };
      });
    const instance = testModel.create({ prop: '' });

    onMiddleware(instance, mockCallback, {
      actionName: 'testAction',
      type: 'flow_spawn',
    });

    instance.parentAction('newValue');
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('calls the callback when subscribed to parent action and parent action has called', () => {
    const mockCallback = jest.fn();
    const testModel = types
      .model({
        prop: types.string,
      })
      .actions((self) => {
        return {
          childAction(value: string) {
            self.prop = value;
          },
          parentAction(value: string) {
            this.childAction(value);
          },
        };
      });

    const instance = testModel.create({ prop: '' });

    onMiddleware(instance, mockCallback, {
      actionName: 'parentAction',
      type: 'action',
    });

    instance.parentAction('newValue');
    expect(mockCallback).toHaveBeenCalledWith('newValue');
  });

  it('does not call the callback when subscribed to parent action and child action has called', () => {
    const mockCallback = jest.fn();
    const testModel = types
      .model({
        prop: types.string,
      })
      .actions((self) => {
        return {
          childAction(value: string) {
            self.prop = value;
          },
          parentAction(value: string) {
            this.childAction(value);
          },
        };
      });

    const instance = testModel.create({ prop: '' });

    onMiddleware(instance, mockCallback, {
      actionName: 'parentAction',
      type: 'action',
    });

    instance.parentAction('newValue');
    expect(mockCallback).not.toHaveBeenCalledWith();
  });
});
