import type { IServerApi } from '../types';

export class ServerApi implements IServerApi {
  private failRequests = false;

  private readonly sentMessages: string[] = [];

  public sendMessage = (text: string): void => {
    if (this.failRequests) {
      // eslint-disable-next-line no-console
      console.error('sendMessage failed');
      throw new Error('sendMessage failed');
    }

    this.sentMessages.push(text);
    // eslint-disable-next-line no-console
    console.log('sendMessage called with:', text);
  };

  public doFailRequests(): void {
    this.failRequests = true;
  }

  public doSucceedRequests(): void {
    this.failRequests = false;
  }

  public getSentMessages(): readonly string[] {
    return this.sentMessages;
  }

  public clearSentMessages(): void {
    this.sentMessages.length = 0;
  }
}
