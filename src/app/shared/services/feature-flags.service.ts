import * as configcat from 'configcat-js';
import { IConfigCatClient } from 'configcat-common/lib/ConfigCatClient';
import { LogLevel } from 'configcat-common';
import { environment } from '../../../environments/environment';


export class FeatureFlagsService {
  public configCatClient: IConfigCatClient;
  public logger = configcat.createConsoleLogger(LogLevel.Info);

  constructor(
  ) {}

  start(){
    this.configCatClient = configcat.createClientWithManualPoll(environment.configCatKey,
      {
        logger: this.logger
      });
  }

}
