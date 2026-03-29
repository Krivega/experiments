const storeDependencies = {
  serverApi: {
    getData: async () => {
      return { id: '1', name: 'John Doe' };
    },
    patchData: async (data: { id: string; name: string }) => {
      return data;
    },
  },
  coreApi: {
    hideAllNotifications: () => {},
    notifyErrorActionValidation: () => {},
    notifyErrorAction: () => {},
    onChanged: (callback: (id: string) => void) => {
      return (id: string) => {
        callback(id);
      };
    },
  },
};

export type TStoreDependencies = typeof storeDependencies;

export default storeDependencies;
