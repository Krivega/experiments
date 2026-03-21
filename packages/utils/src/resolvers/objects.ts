export const resolveFindById = <T extends { id?: string }>(list: T[]) => {
  return (id: string) => {
    return list.find((item) => {
      return item.id === id;
    });
  };
};

export const resolveEqualsByProperty = <T = unknown>(property: string) => {
  return (object1?: Record<string, T>) => {
    return (object2?: Record<string, T>) => {
      if (object1 === undefined && object2 === undefined) {
        return true;
      }

      if (!object1 || !object2) {
        return false;
      }

      return object1[property] === object2[property];
    };
  };
};
