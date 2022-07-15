export default class SetTimeoutRequest {
  _requestID?: NodeJS.Timeout;

  request(timeoutFunc: () => void, delay: number) {
    this.cancelRequest();
    this.requestID = setTimeout(timeoutFunc, delay);
  }

  cancelRequest() {
    const { requestID } = this;

    if (requestID) {
      clearTimeout(requestID);
      this.requestID = undefined;
    }
  }

  set requestID(requestID) {
    this._requestID = requestID;
  }

  get requestID() {
    return this._requestID;
  }

  get requested(): boolean {
    return !!this.requestID;
  }
}
