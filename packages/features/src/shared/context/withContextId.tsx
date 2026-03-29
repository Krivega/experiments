type TWithContextId = {
  contextId: string;
};

const withContextId = (
  Component: React.ComponentType<TWithContextId>,
  contextId: string,
): React.ComponentType => {
  const WrappedComponent = () => {
    return <Component contextId={contextId} />;
  };

  WrappedComponent.displayName = Component.displayName;

  return WrappedComponent;
};

export default withContextId;
