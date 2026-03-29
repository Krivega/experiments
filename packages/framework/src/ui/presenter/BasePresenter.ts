/* eslint-disable @typescript-eslint/class-methods-use-this */
import type { ISimpleType, ModelInstanceTypeProps, ReferenceIdentifier } from 'mobx-state-tree';
import type {
  IBaseStore,
  TActionPropsView,
  TDestroy,
  TErrorMessagesDefault,
  TExecutableAction,
  TFormFieldModel,
  TFormFieldView,
  TStateFieldModel,
  TStateFieldView,
} from './types';

const errorMessagesDefault: TErrorMessagesDefault = {};

export abstract class BasePresenter<
  TPropsView,
  TStore extends IBaseStore = IBaseStore,
  TFields = unknown,
  TActions = unknown,
  TErrorMessages extends TErrorMessagesDefault = TErrorMessagesDefault,
> {
  protected errorMessages: TErrorMessages = errorMessagesDefault as TErrorMessages;

  protected store: TStore;

  private cache: {
    propsView?: TPropsView;
    fields?: TFields;
    actions?: TActions;
  } = {};

  public constructor({ store }: { store: TStore }) {
    this.store = store;
  }

  public init(): TDestroy {
    return () => {
      this.store.destroy();
    };
  }

  /**
   * Получение кешированных полей для View
   * Поля создаются только один раз и кешируются
   */
  public getFields = (): TFields => {
    this.cache.fields ??= this.createFields();

    return this.cache.fields;
  };

  /**
   * Получение кешированных пропсов для View
   * Пропсы создаются только один раз и кешируются
   */
  public getPropsView = (): TPropsView => {
    this.cache.propsView ??= this.createPropsView();

    return this.cache.propsView;
  };

  /**
   * Получение кешированных экшенов для View
   * Экшены создаются только один раз и кешируются
   */
  public getActions = (): TActions => {
    this.cache.actions ??= this.createActions();

    return this.cache.actions;
  };

  protected clearCache(): void {
    this.cache = {};
  }

  protected parseStateFieldToPropsView<TValue, TValueToView = TValue>(
    field: TStateFieldModel<TValue>,
    {
      parseValueToView = (value: TValue) => {
        return value as unknown as TValueToView;
      },
      parseValueToStore = (value: TValueToView) => {
        return value as unknown as TValue;
      },
    }: {
      parseValueToView?: (value: TValue) => TValueToView;
      parseValueToStore?: (value: TValueToView) => TValue;
    } = {},
  ): TStateFieldView<TValueToView> {
    return {
      getValue: () => {
        return parseValueToView(field.getValue());
      },
      onChange: (value: TValueToView) => {
        field.setValue(parseValueToStore(value));
      },
      hasDisabled: field.hasDisabled,
    };
  }

  protected parseReferenceFormFieldToPropsView<
    TValue extends
      | ModelInstanceTypeProps<{
          id: ISimpleType<ReferenceIdentifier>;
        }>
      | undefined,
    TValueToView = TValue extends { id: infer TId } ? TId | undefined : never,
  >(
    field: Omit<TFormFieldModel<TValue>, 'setValue'> & {
      setValue: (value: ReferenceIdentifier | undefined) => void;
    },
    {
      parseValueToView = (value: ReferenceIdentifier | undefined) => {
        return value as unknown as TValueToView;
      },
      parseValueToStore = (value: TValueToView) => {
        return value as unknown as ReferenceIdentifier | undefined;
      },
    }: {
      parseValueToView?: (value: ReferenceIdentifier | undefined) => TValueToView;
      parseValueToStore?: (value: TValueToView) => ReferenceIdentifier | undefined;
    } = {},
  ): TFormFieldView<TValueToView, TErrorMessages[keyof TErrorMessages] | undefined> {
    return {
      getValue: () => {
        const value = field.getValue()?.id;

        return parseValueToView(value);
      },
      onChange: (value: TValueToView) => {
        field.setValue(parseValueToStore(value));
      },
      getError: () => {
        const error = field.getError();

        return this.getFormattedError(error);
      },
      hasDisabled: field.hasDisabled,
      hasValid: field.hasValid,
    };
  }

  protected parseFormFieldToPropsView<TValue, TValueToView = TValue>(
    field: TFormFieldModel<TValue>,
    {
      parseValueToView = (value: TValue) => {
        return value as unknown as TValueToView;
      },
      parseValueToStore = (value: TValueToView) => {
        return value as unknown as TValue;
      },
    }: {
      parseValueToView?: (value: TValue) => TValueToView;
      parseValueToStore?: (value: TValueToView) => TValue;
    } = {},
  ): TFormFieldView<TValueToView, TErrorMessages[keyof TErrorMessages] | undefined> {
    return {
      getValue: () => {
        return parseValueToView(field.getValue());
      },
      onChange: (value: TValueToView) => {
        field.setValue(parseValueToStore(value));
      },
      getError: () => {
        const error = field.getError();

        return this.getFormattedError(error);
      },
      hasDisabled: field.hasDisabled,
      hasValid: field.hasValid,
    };
  }

  protected parseExecutableActionToPropsView<TExecuteArgs extends unknown[] = []>(
    executableAction: TExecutableAction<TExecuteArgs>,
  ): TActionPropsView<TExecuteArgs> {
    return {
      onClick: (...args: TExecuteArgs) => {
        executableAction.execute(...args);
      },
      hasDisabled: (...args: TExecuteArgs) => {
        return !executableAction.canExecute(...args);
      },
    };
  }

  protected getFormattedError = (error: string | undefined) => {
    if (error === undefined || !(error in this.errorMessages)) {
      return undefined;
    }

    return this.errorMessages[error as keyof typeof this.errorMessages];
  };

  /**
   * Метод для создания полей для View
   * Может быть переопределен в дочерних классах
   * По умолчанию возвращает пустой объект
   */
  protected createFields(): TFields {
    return {} as TFields;
  }

  /**
   * Метод для создания экшенов для View
   * Может быть переопределен в дочерних классах
   * По умолчанию возвращает пустой объект
   */
  protected createActions(): TActions {
    return {} as TActions;
  }

  /**
   * Абстрактный метод для создания пропсов для View
   * Должен быть реализован в дочерних классах
   */
  protected abstract createPropsView(): TPropsView;
}
