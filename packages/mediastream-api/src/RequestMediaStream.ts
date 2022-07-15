import { getCancelableMediaStream } from './index';
import stopTracksMediaStream from './stopTracksMediaStream';

export default class RequestMediaStream {
  _mediaStream?: MediaStream;

  _requested: boolean;

  _requestObj?: ReturnType<typeof getCancelableMediaStream>;

  /**
   * @constructor
   */
  constructor() {
    this._requested = false;
  }

  request = async (constraints, options) => {
    this.requested = true;
    this.cancelRequest();

    await this.stopMediaStream();

    this.requestObj = getCancelableMediaStream(constraints, options);

    const mediaStream = await this.requestObj;

    this.requested = false;
    this.mediaStream = mediaStream;

    return mediaStream;
  };

  /**
   * cancelRequest
   * @returns {void}
   */
  cancelRequest() {
    const request = this.requestObj;

    if (request) {
      request.cancel();
    }
  }

  /**
   * stopMediaStream
   * @returns {Promise|function} stopMediaStream
   */
  stopMediaStream = () => {
    const { mediaStream } = this;

    if (!mediaStream) {
      return Promise.resolve();
    }

    return stopTracksMediaStream(mediaStream);
  };

  /**
   * mediaStream setter
   * @param {Object} mediaStream mediaStream
   * @returns {void}
   */
  set mediaStream(mediaStream) {
    this._mediaStream = mediaStream;
  }

  /**
   * mediaStream getter
   * @returns {Object} mediaStream mediaStream
   */
  get mediaStream() {
    return this._mediaStream;
  }

  /**
   * requestObj setter
   * @param {Object} request request
   * @returns {void}
   */
  set requestObj(request) {
    this._requestObj = request;
  }

  /**
   * requestObj getter
   * @returns {Object} requestObj requestObj
   */
  get requestObj() {
    return this._requestObj;
  }

  /**
   * requested setter
   * @param {boolean} requested requested
   * @returns {void}
   */
  set requested(requested) {
    this._requested = requested;
  }

  /**
   * requested getter
   * @returns {boolean} true if request is active
   */
  get requested() {
    return this._requested;
  }
}
