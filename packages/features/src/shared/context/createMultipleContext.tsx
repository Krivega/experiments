/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-multi-comp */
import { createContext, useContext, useMemo } from 'react';

type TBaseValue = Record<string, unknown>;

type TBasePropsProvider<TValue> = {
  children: React.ReactNode;
  contextId: string;
  value: TValue;
};

const createMultipleContext = <TValue extends TBaseValue = TBaseValue>() => {
  const contextsMap = new Map<string, React.Context<TValue | undefined>>();

  const getOrCreateContext = (contextId: string) => {
    let context = contextsMap.get(contextId);

    if (context === undefined) {
      context = createContext<TValue | undefined>(undefined);

      contextsMap.set(contextId, context);
    }

    return context;
  };

  const useGetContext = (contextId: string) => {
    return useMemo(() => {
      return getOrCreateContext(contextId);
    }, [contextId]);
  };

  const Provider = ({ contextId, value, children }: TBasePropsProvider<TValue>) => {
    const Context = useGetContext(contextId);

    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  const withContext = (Component: React.ComponentType<TValue>) => {
    const WrappedComponent = ({ contextId }: { contextId: string }) => {
      const Context = useGetContext(contextId);
      const value = useContext(Context);

      if (value === undefined) {
        return undefined;
      }

      return <Component {...value} />;
    };

    WrappedComponent.displayName = Component.displayName;

    return WrappedComponent;
  };

  return { Provider, withContext };
};

export default createMultipleContext;
