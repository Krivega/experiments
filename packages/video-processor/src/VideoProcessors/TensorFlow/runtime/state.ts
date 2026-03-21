import type { TModelSelection } from '../../../typings';

type TState = {
  modelSelection?: TModelSelection;
};

const createState = () => {
  const state: TState = {};

  const getState = (): TState => {
    return state;
  };
  const getStateValue = (name: keyof TState): string | undefined => {
    return state[name as keyof TState];
  };
  const setStateValue = <K extends keyof TState>(name: K, value?: TState[K]) => {
    state[name] = value;
  };

  const initState = ({ modelSelection }: TState) => {
    setStateValue('modelSelection', modelSelection);
  };

  return {
    getStateValue,
    getState,
    setStateValue,
    initState,
  };
};

export default createState;
