import { IConfigCatClient } from 'configcat-common/lib/ConfigCatClient';
import * as configcat from 'configcat-js';
import { environment } from '../../../environments/environment';

export class FeatureFlagsService {
  public configCatClient: IConfigCatClient;

  constructor() {}

  start(){
    this.configCatClient = configcat.createClientWithManualPoll(environment.configCatKey,{}
      );
  }
}
