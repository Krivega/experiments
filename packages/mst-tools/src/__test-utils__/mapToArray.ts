const mapToArray = <V>(map: Map<number | string, V>): V[] => {
  return [...map.values()];
};

export default mapToArray;
