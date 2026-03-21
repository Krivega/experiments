const copyToClipboard = async (text: string): Promise<void> => {
  return import('copy-to-clipboard')
    .then((m) => {
      return m.default;
    })
    .then(async (copy) => {
      return new Promise((resolve, reject) => {
        const result = copy(text, {
          onCopy: () => {
            resolve();
          },
        });

        if (!result) {
          reject(new Error('Copy failed'));
        }
      });
    });
};

const copyTextToClipboard = async (text: string): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (navigator.clipboard === undefined) {
    return copyToClipboard(text);
  }

  return navigator.clipboard.writeText(text);
};

export default copyTextToClipboard;
