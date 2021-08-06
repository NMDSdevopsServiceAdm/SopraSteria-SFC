import { mockConfigCatClient } from '@core/test-utils/MockConfigCatClient';
import { IConfigCatClient } from 'configcat-common/lib/ConfigCatClient';
import * as configcat from 'configcat-js';
import { environment } from 'src/environments/environment';

export class FeatureFlagsService {
  public configCatClient: IConfigCatClient;

  constructor() {}

  start(): void {
    if (environment.environmentName === 'other') {
      this.configCatClient = mockConfigCatClient;
    } else {
      this.configCatClient = configcat.createClientWithManualPoll(environment.configCatKey, {});
    }
  }
}
