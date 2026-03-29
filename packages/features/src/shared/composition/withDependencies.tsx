/* eslint-disable react/jsx-props-no-spreading */
const withDependencies = <
  TProps extends Record<string, unknown>,
  TDependencies extends Partial<TProps>,
  TRemainingProps = Omit<TProps, keyof TDependencies>,
>(
  Component: React.ComponentType<TProps>,
  dependencies: TDependencies,
): React.ComponentType<TRemainingProps> => {
  const WrappedComponent = (props: TRemainingProps) => {
    const combinedProps = { ...dependencies, ...props } as TProps;

    return <Component {...combinedProps} />;
  };

  WrappedComponent.displayName = Component.displayName;

  return WrappedComponent;
};

export default withDependencies;
