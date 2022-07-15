import type { TModelSelection } from '../../../typings';

type TState = {
  modelSelection?: TModelSelection;
};

const createState = () => {
  const state: TState = {};

  const getState = (): TState => {
    return state;
  };
  const getStateValue = (name: string): string | undefined => {
    return state[name];
  };
  const setStateValue = (name: string, value?: string) => {
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
