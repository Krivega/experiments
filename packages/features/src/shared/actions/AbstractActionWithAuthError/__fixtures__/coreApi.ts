export class CoreApi {
  public hideAllNotifications = jest.fn();

  public showErrorAction = jest.fn();

  public showErrorActionUnauthorized = jest.fn();
}

export type TCoreApi = CoreApi;

export default CoreApi;
