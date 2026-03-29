import Model from '../../@Model/Model';
import { CoreApi, ServerApi } from '../../__fixtures__';
import SyncModeratorStatus from '../SyncModeratorStatus';

import type { TInstance } from '../../@Model/Model';

const serverApi = new ServerApi();

describe('SyncModeratorStatus', () => {
  let instance: TInstance;
  let coreApi: CoreApi;
  let reaction: SyncModeratorStatus;

  beforeEach(() => {
    instance = Model.create({ isModerator: false });
    coreApi = new CoreApi();

    reaction = new SyncModeratorStatus({
      instance,
      dependencies: { coreApi, serverApi },
      executableActions: {},
    });

    reaction.start();
  });

  afterEach(() => {
    reaction.stop();
  });

  it('устанавливает isModerator=true в модели если coreApi.hasModerator => true', () => {
    expect(instance.isModerator).toBe(false);

    coreApi.setIsModerator(true);

    expect(instance.isModerator).toBe(true);
  });

  it('устанавливает isModerator=false в модели если coreApi.hasModerator => false', () => {
    coreApi.setIsModerator(true);
    coreApi.setIsModerator(false);

    expect(instance.isModerator).toBe(false);
  });
});
