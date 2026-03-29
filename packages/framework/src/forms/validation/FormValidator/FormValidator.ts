import { reaction } from 'mobx';

import FieldValidator from './FieldValidator';
import { AbstractSubscriber } from '../../../core';

import type { TActions, TFieldSchemas, TFieldValidator, TStateDependence } from './types';

class FormValidator<
  Schema extends TFieldSchemas<Schema, TValue>,
  FieldName extends keyof TStateDependence<Schema>,
  TValue extends TStateDependence<Schema>[FieldName],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> extends AbstractSubscriber<any> {
  private readonly validationSchemas: {
    fieldName: FieldName;
    validator: TFieldValidator<Schema, TValue>;
    actions: TActions;
  }[];

  public constructor(schema: Schema) {
    super();

    this.validationSchemas = Object.entries(schema).map(([fieldName, { getRules, actions }]) => {
      const validator = new FieldValidator(getRules);

      return { fieldName: fieldName as FieldName, validator, actions } as const;
    });
  }

  public subscribe = ({
    getStateDependence,
  }: {
    getStateDependence: () => TStateDependence<Schema>;
  }) => {
    this.unsubscribe();

    this.disposeReaction = reaction<TStateDependence<Schema>, boolean>(
      getStateDependence,
      this.validate,
      {
        fireImmediately: true,
      },
    );
  };

  public unsubscribe = () => {
    this.disposeReaction();
  };

  private readonly validate = (stateDependence: TStateDependence<Schema>) => {
    this.validationSchemas.forEach(({ fieldName, validator, actions }) => {
      const value = stateDependence[fieldName];
      const error = validator.validate(value as TValue, stateDependence);

      if (error === undefined) {
        actions.onValid();
      } else {
        actions.onError(error);
      }
    });
  };
}

export default FormValidator;
