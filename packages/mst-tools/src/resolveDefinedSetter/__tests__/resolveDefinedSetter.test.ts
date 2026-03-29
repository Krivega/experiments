/* eslint-disable unicorn/no-null */
/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="jest" />
import { types } from 'mobx-state-tree';

import resolveDefinedSetter from '../resolveDefinedSetter';

import type { Instance, SnapshotOrInstance, SnapshotOut } from 'mobx-state-tree';
import type { Equal, Expect, TInstanceModel } from '../../types';

const SUCCESS_ENUM = 'SUCCESS_ENUM';

describe('resolveDefinedSetter', () => {
  type TModelSnapshotOrInstance = SnapshotOrInstance<typeof Model> | SnapshotOut<typeof Model>;

  type TValueChildModel = TInstanceModel<typeof ChildModel>;

  type TModelTypes = {
    valueChildModel: { value: number };
    valueNumber: number;
    valueString: string;
    valueDate: Date;
    valueBoolean: boolean;
    valueNull: null;
    valueUndefined: undefined;
    valueArrayString: string[];
    valueReference: TValueChildModel['value'];
    valueMayBeNumber?: number;
    valueEnumeration: typeof SUCCESS_ENUM;
  };

  let modelTypes: TModelTypes;

  const ChildModel = types
    .model({
      value: types.number,
    })
    .actions((self) => {
      const resolveSelfDefinedSetter = resolveDefinedSetter(self);
      const setValue = resolveSelfDefinedSetter('value');

      return {
        setValue,
      };
    });

  const Model = types
    .model({
      valueChildModel: ChildModel,
      valueNumber: types.number,
      valueString: types.string,
      valueDate: types.Date,
      valueBoolean: types.boolean,
      valueNull: types.null,
      valueUndefined: types.undefined,
      valueMapString: types.map(types.string),
      valueArrayString: types.array(types.string),
      valueReference: types.reference(ChildModel),
      valueOptionalString: types.optional(types.string, 'any string'),
      valueSafeReference: types.safeReference(ChildModel),
      valueMayBeNumber: types.maybe(types.number),
      valueEnumeration: types.enumeration([SUCCESS_ENUM]),
    })
    .actions((self) => {
      const resolveSelfDefinedSetter = resolveDefinedSetter(self);

      return {
        setValueChildModel: resolveSelfDefinedSetter('valueChildModel'),
        setValueNumber: resolveSelfDefinedSetter('valueNumber'),
        setValueString: resolveSelfDefinedSetter('valueString'),
        setValueDate: resolveSelfDefinedSetter('valueDate'),
        setValueBoolean: resolveSelfDefinedSetter('valueBoolean'),
        setValueNull: resolveSelfDefinedSetter('valueNull'),
        setValueUndefined: resolveSelfDefinedSetter('valueUndefined'),
        setValueMapString: resolveSelfDefinedSetter('valueMapString'),
        setValueArrayString: resolveSelfDefinedSetter('valueArrayString'),
        setValueReference: resolveSelfDefinedSetter('valueReference'),
        setValueOptionalString: resolveSelfDefinedSetter('valueOptionalString'),
        setValueSafeReference: resolveSelfDefinedSetter('valueSafeReference'),
        setValueMayBeNumber: resolveSelfDefinedSetter('valueMayBeNumber'),
        setValueEnumeration: resolveSelfDefinedSetter('valueEnumeration'),
      };
    })
    .volatile(() => {
      return {
        valueVolatile: '',
      };
    });

  let modelInstance: Instance<typeof Model>;

  beforeEach(() => {
    const childState = { value: 1 };

    modelTypes = {
      valueChildModel: childState,
      valueNumber: 1,
      valueString: 'string',
      valueDate: new Date(),
      valueBoolean: true,
      valueNull: null,
      valueUndefined: undefined,
      valueArrayString: ['string'],
      valueReference: childState.value,
      valueMayBeNumber: 2,
      valueEnumeration: SUCCESS_ENUM,
    };

    modelInstance = Model.create(modelTypes);
  });

  describe('базовая функциональность', () => {
    it('должен устанавливать значение', () => {
      const instance = ChildModel.create({ value: 1 });

      instance.setValue(2);

      expect(instance.value).toBe(2);
    });
  });

  describe('типизация для различных типов MST', () => {
    it('должен устанавливать types.childModel значение с типом ChildModel', () => {
      type TParametersToCheck = Parameters<typeof modelInstance.setValueChildModel>[0];

      const caseSetValueChildModel: Expect<
        Equal<TParametersToCheck, TModelSnapshotOrInstance['valueChildModel']>
      > = true;

      expect(caseSetValueChildModel).toBe(true);
    });

    it('должен устанавливать types.number значение с типом number', () => {
      type TParametersToCheck = Parameters<typeof modelInstance.setValueNumber>[0];

      const caseSetValueNumber: Expect<
        Equal<TParametersToCheck, TModelSnapshotOrInstance['valueNumber']>
      > = true;

      expect(caseSetValueNumber).toBe(true);
    });

    it('должен устанавливать types.string значение с типом string', () => {
      type TParametersToCheck = Parameters<typeof modelInstance.setValueString>[0];

      const caseSetValueString: Expect<
        Equal<TParametersToCheck, TModelSnapshotOrInstance['valueString']>
      > = true;

      expect(caseSetValueString).toBe(true);
    });

    it('должен устанавливать types.Date значение с типом Date', () => {
      type TParametersToCheck = Parameters<typeof modelInstance.setValueDate>[0];

      const caseSetValueDate: Expect<
        Equal<TParametersToCheck, TModelSnapshotOrInstance['valueDate']>
      > = true;

      expect(caseSetValueDate).toBe(true);
    });

    it('должен устанавливать types.boolean значение с типом boolean', () => {
      type TParametersToCheck = Parameters<typeof modelInstance.setValueBoolean>[0];

      const caseSetValueBoolean: Expect<
        Equal<TParametersToCheck, TModelSnapshotOrInstance['valueBoolean']>
      > = true;

      expect(caseSetValueBoolean).toBe(true);
    });

    it('должен устанавливать types.null значение с типом null', () => {
      type TParametersToCheck = Parameters<typeof modelInstance.setValueNull>[0];

      const caseSetValueNull: Expect<
        Equal<TParametersToCheck, TModelSnapshotOrInstance['valueNull']>
      > = true;

      expect(caseSetValueNull).toBe(true);
    });

    it('должен устанавливать types.undefined значение с типом undefined', () => {
      type TParametersToCheck = Parameters<typeof modelInstance.setValueUndefined>[0];

      const caseSetValueUndefined: Expect<
        Equal<TParametersToCheck, TModelSnapshotOrInstance['valueUndefined']>
      > = true;

      expect(caseSetValueUndefined).toBe(true);
    });

    it('должен устанавливать types.map значение с типом map', () => {
      type TParametersToCheck = Parameters<typeof modelInstance.setValueMapString>[0];

      const caseSetValueMapString: Expect<
        Equal<TParametersToCheck, TModelSnapshotOrInstance['valueMapString']>
      > = true;

      expect(caseSetValueMapString).toBe(true);
    });

    it('должен устанавливать types.arrayString значение с типом array of string', () => {
      type TParametersToCheck = Parameters<typeof modelInstance.setValueArrayString>[0];

      const caseSetValueArrayString: Expect<
        Equal<TParametersToCheck, TModelSnapshotOrInstance['valueArrayString']>
      > = true;

      expect(caseSetValueArrayString).toBe(true);
    });

    it('должен устанавливать types.reference значение с типом reference of ChildModel', () => {
      type TParametersToCheck = Parameters<typeof modelInstance.setValueReference>[0];

      const caseSetValueReference: Expect<
        Equal<TParametersToCheck, TModelSnapshotOrInstance['valueReference']>
      > = true;

      expect(caseSetValueReference).toBe(true);
    });

    it('должен устанавливать types.optionalString значение с типом string', () => {
      type TParametersToCheck = Parameters<typeof modelInstance.setValueOptionalString>[0];

      const caseSetValueOptionalString: Expect<
        Equal<TParametersToCheck, TModelSnapshotOrInstance['valueOptionalString']>
      > = true;

      expect(caseSetValueOptionalString).toBe(true);
    });

    it('должен устанавливать types.safeReference значение с типом safe reference of ChildModel', () => {
      type TParametersToCheck = Parameters<typeof modelInstance.setValueSafeReference>[0];

      const caseSetValueSafeReference: Expect<
        Equal<TParametersToCheck, TModelSnapshotOrInstance['valueSafeReference']>
      > = true;

      expect(caseSetValueSafeReference).toBe(true);
    });

    it('должен устанавливать types.mayBeNumber значение с типом may be number', () => {
      type TParametersToCheck = Parameters<typeof modelInstance.setValueMayBeNumber>[0];

      const caseSetValueMayBeNumber: Expect<
        Equal<TParametersToCheck, TModelSnapshotOrInstance['valueMayBeNumber']>
      > = true;

      expect(caseSetValueMayBeNumber).toBe(true);
    });

    it('должен устанавливать types.enumeration значение с типом enumeration', () => {
      type TParametersToCheck = Parameters<typeof modelInstance.setValueEnumeration>[0];

      const caseSetValueEnumeration: Expect<
        Equal<TParametersToCheck, TModelSnapshotOrInstance['valueEnumeration']>
      > = true;

      expect(caseSetValueEnumeration).toBe(true);
    });

    it('volatile должен иметь valueVolatile с типом string', () => {
      type TParametersToCheck = typeof modelInstance.valueVolatile;

      const caseValueVolatile: Expect<Equal<TParametersToCheck, string>> = true;

      expect(caseValueVolatile).toBe(true);
    });
  });

  describe('поведение с undefined значениями', () => {
    it('не записывает данные при undefined значении для maybe полей', () => {
      const MaybeModel = types
        .model({
          maybeField: types.maybe(types.number),
        })
        .actions((self) => {
          const resolveSelfDefinedSetter = resolveDefinedSetter(self);
          const setMaybeField = resolveSelfDefinedSetter('maybeField');

          return { setMaybeField };
        });

      const instance = MaybeModel.create({ maybeField: 1 });

      instance.setMaybeField(undefined);

      expect(instance.maybeField).toBe(1); // Значение остается прежним
    });

    it('не записывает данные при undefined для optional полей', () => {
      const OptionalModel = types
        .model({
          optionalField: types.optional(types.number, 0),
        })
        .actions((self) => {
          const resolveSelfDefinedSetter = resolveDefinedSetter(self);
          const setOptionalField = resolveSelfDefinedSetter('optionalField');

          return { setOptionalField };
        });

      const instance = OptionalModel.create({ optionalField: 1 });

      instance.setOptionalField(2);

      expect(instance.optionalField).toBe(2);

      // resolveDefinedSetter не записывает данные при undefined
      instance.setOptionalField(undefined);

      expect(instance.optionalField).toBe(2);
    });
  });
});
