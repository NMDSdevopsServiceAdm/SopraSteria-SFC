import { LogLevel } from 'configcat-common';
import { IConfigCatClient } from 'configcat-common/lib/ConfigCatClient';
import * as configcat from 'configcat-js';

import { environment } from '../../../environments/environment';

export class FeatureFlagsService {
  public configCatClient: IConfigCatClient;
  public logger = configcat.createConsoleLogger(LogLevel.Info);

  constructor() {}

  start() {
    this.configCatClient = configcat.createClientWithAutoPoll(environment.configCatKey, {
      pollIntervalSeconds: 2,
      logger: this.logger,
    });
  }
}
