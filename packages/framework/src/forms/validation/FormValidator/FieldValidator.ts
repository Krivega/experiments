type TRule<TStateDependence, TValue> = (
  value: TValue,
  stateDependence: TStateDependence,
) => string | undefined;

type TFieldValidator<TStateDependence, TValue> = {
  validate: (value: TValue, stateDependence: TStateDependence) => string | undefined;
};

class FieldValidator<TStateDependence, TValue> implements TFieldValidator<
  TStateDependence,
  TValue
> {
  private readonly getRules: (
    stateDependence: TStateDependence,
  ) => TRule<TStateDependence, TValue>[];

  public constructor(
    getRules: (stateDependence: TStateDependence) => TRule<TStateDependence, TValue>[],
  ) {
    this.getRules = getRules;
  }

  public validate = (value: TValue, stateDependence: TStateDependence): string | undefined => {
    for (const rule of this.getRules(stateDependence)) {
      const error = rule(value, stateDependence);

      if (error !== undefined) {
        return error;
      }
    }

    return undefined;
  };
}

export default FieldValidator;
