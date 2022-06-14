/* eslint-disable no-param-reassign */
/**
 * resolveSetConstraints
 * @param {Object} constraints constraints
 * @returns {Object} constraints
 */
export const resolveSetConstraints = (constraints) => (type) => (key, value) => {
  if (!value) {
    return undefined;
  }

  if (!constraints[key]) {
    constraints[key] = {};
  }

  return Object.assign(constraints[key], { [type]: value });
};
/* eslint-enable no-param-reassign */

/* eslint-disable no-param-reassign */
/**
 * resolveSetProp
 * @param {Object} obj obj
 * @returns {void}
 */
export const resolveSetProp = (obj) => (key, value) => {
  if (value) {
    obj[key] = value;
  }
};
/* eslint-enable no-param-reassign */
