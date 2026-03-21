import {
  msPerDay,
  msPerHour,
  msPerMinute,
  msPerMonth,
  msPerSecond,
  msPerWeek,
  msPerYear,
} from '../constants';

export const calculateSeconds = (elapsed: number) => {
  return Math.floor(elapsed / msPerSecond);
};
export const calculateMinutes = (elapsed: number) => {
  return Math.floor(elapsed / msPerMinute);
};
export const calculateHours = (elapsed: number) => {
  return Math.floor(elapsed / msPerHour);
};
export const calculateDays = (elapsed: number) => {
  return Math.floor(elapsed / msPerDay);
};
export const calculateMonths = (elapsed: number) => {
  return Math.floor(elapsed / msPerMonth);
};

export const calculateRemainingMinutes = (elapsed: number) => {
  return Math.floor((elapsed % msPerHour) / msPerMinute);
};

export const calculateRemainingHours = (elapsed: number) => {
  return Math.floor((elapsed % msPerDay) / msPerHour);
};
export const calculateRemainingDays = (elapsed: number) => {
  return Math.floor((elapsed % msPerMonth) / msPerDay);
};

export const isPastAndOnlyInFuture = (elapsed: number, isOnlyInFuture: boolean): boolean => {
  return elapsed <= 0 && isOnlyInFuture;
};

export const isLessThanAMinute = (elapsed: number): boolean => {
  return elapsed < msPerMinute;
};

export const isLessThanAnHour = (elapsed: number): boolean => {
  return elapsed < msPerHour;
};

export const isLessThanADay = (elapsed: number): boolean => {
  return elapsed < msPerDay;
};

export const isLessThanAWeekOrMonth = (elapsed: number): boolean => {
  return elapsed < msPerWeek || elapsed < msPerMonth;
};

export const isLessThanAYear = (elapsed: number): boolean => {
  return elapsed < msPerYear;
};
