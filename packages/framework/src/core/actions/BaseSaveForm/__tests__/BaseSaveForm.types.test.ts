/// <reference types="jest" />
import { types } from 'mobx-state-tree';

import { createFormSyncModel, withRememberState } from '@/state-management';
import { BaseSaveForm } from '../BaseSaveForm';

import type { Instance } from 'mobx-state-tree';

const serverApi = {
  hasAbortedError: jest.fn().mockImplementation(() => {
    return false;
  }),
  setData: jest.fn().mockImplementation(() => {
    return {
      promise: Promise.resolve(),
      abort: jest.fn(),
    };
  }),
};

const coreApi = {
  hideAllNotifications: jest.fn(),
  showSuccessSavingForm: jest.fn(),
  showFailedToSaveFormError: jest.fn(),
};

describe('BaseSaveForm: типы', () => {
  it('должен определить, что экземпляр модели расширяет тип TBaseInstance', () => {
    const BaseFieldsModel = types.model({}).views(() => {
      return {
        hasValid() {
          return true;
        },
        get currentState() {
          return {
            id: 'test-id',
            name: 'test-name',
            value: 42,
          };
        },
      };
    });

    const FieldsModel = withRememberState(BaseFieldsModel);
    const Model = createFormSyncModel(FieldsModel);

    type TInstance = Instance<typeof Model>;
    type TState = TInstance['fields']['currentState'];

    class TestSaveForm extends BaseSaveForm<TState, void, TInstance> {}

    const testSaveForm = new TestSaveForm({
      instance: Model.create({}),
      dependencies: { coreApi, serverApi },
    });

    // @ts-expect-error - доступ к приватному экземпляру модели
    const { instance } = testSaveForm;

    expect(instance.fields).toHaveProperty('currentState');
    expect(instance).toHaveProperty('canSave');
    expect(instance).toHaveProperty('setSaveInProgress');
    expect(instance).toHaveProperty('setSaveError');
    expect(instance).toHaveProperty('rememberState');
  });
});
