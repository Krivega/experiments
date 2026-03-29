/// <reference types="jest" />
import resolveDisableRule from '../resolveDisableRule';

describe('resolveDisableRule', () => {
  let getRules: ReturnType<typeof resolveDisableRule<{ isEnabled: boolean }>>;

  const predicate = (state: { isEnabled: boolean }) => {
    return state.isEnabled;
  };

  beforeEach(() => {
    getRules = resolveDisableRule(predicate);
  });

  it('возвращает пустой массив когда условие включения выполняется', () => {
    const rules = getRules({ isEnabled: true });

    expect(Array.isArray(rules)).toBe(true);
    expect(rules).toHaveLength(0);
  });

  it('возвращает массив из одного правила (getDisabledState) когда условие включения не выполняется', () => {
    const rules = getRules({ isEnabled: false });

    expect(rules).toHaveLength(1);
    expect(typeof rules[0]).toBe('function');
    expect(rules[0]()).toBe('DISABLED');
  });
});
