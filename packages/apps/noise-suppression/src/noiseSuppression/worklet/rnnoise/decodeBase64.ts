/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */
const decodeBase64 =
  typeof atob === 'function'
    ? atob
    : (input: string) => {
        const keyString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let output = '';
        let chr1 = 0;
        let chr2 = 0;
        let chr3 = 0;
        let enc1 = 0;
        let enc2 = 0;
        let enc3 = 0;
        let enc4 = 0;
        let index = 0;

        const inputParsed = input.replaceAll(/[^\d+/=A-Za-z]/g, '');

        do {
          enc1 = keyString.indexOf(inputParsed.charAt(index++));
          enc2 = keyString.indexOf(inputParsed.charAt(index++));
          enc3 = keyString.indexOf(inputParsed.charAt(index++));
          enc4 = keyString.indexOf(inputParsed.charAt(index++));
          chr1 = (enc1 << 2) | (enc2 >> 4);
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
          chr3 = ((enc3 & 3) << 6) | enc4;
          output += String.fromCodePoint(chr1);

          if (enc3 !== 64) {
            output += String.fromCodePoint(chr2);
          }

          if (enc4 !== 64) {
            output += String.fromCodePoint(chr3);
          }
        } while (index < inputParsed.length);

        return output;
      };

export default decodeBase64;
