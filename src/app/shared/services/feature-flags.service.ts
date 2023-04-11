import { mockConfigCatClient } from '@core/test-utils/MockConfigCatClient';
import { IConfigCatClient } from 'configcat-common/lib/ConfigCatClient';
import * as configcat from 'configcat-js';
import { environment } from 'src/environments/environment';

export class FeatureFlagsService {
  public configCatClient: IConfigCatClient;
  private _newHomeDesignFlag: boolean;

  constructor() {}

  start(): void {
    if (environment.environmentName === 'other') {
      this.configCatClient = mockConfigCatClient;
    } else {
      this.configCatClient = configcat.createClientWithManualPoll(environment.configCatKey, {});
    }
  }

  public get newHomeDesignFlag(): boolean {
    return this._newHomeDesignFlag;
  }

  public set newHomeDesignFlag(value: boolean) {
    this._newHomeDesignFlag = value;
  }
}
