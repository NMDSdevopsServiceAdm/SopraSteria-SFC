import { mockConfigCatClient } from '@core/test-utils/MockConfigCatClient';
import { IConfigCatClient } from 'configcat-common/lib/ConfigCatClient';
import * as configcat from 'configcat-js';
import { environment } from 'src/environments/environment';

export class FeatureFlagsService {
  public configCatClient: IConfigCatClient;
  private _newHomeDesignFlag: boolean;
  private _newHomeDesignParentFlag: boolean;
  private _newDataAreaFlag: boolean;

  constructor() {}

  async start(): Promise<void> {
    if (environment.environmentName === 'other') {
      this.configCatClient = mockConfigCatClient;
    } else {
      this.configCatClient = await configcat.createClientWithManualPoll(environment.configCatKey, {});
    }
  }

  public get newHomeDesignFlag(): boolean {
    return this._newHomeDesignFlag;
  }

  public set newHomeDesignFlag(value: boolean) {
    this._newHomeDesignFlag = value;
  }

  public get newHomeDesignParentFlag(): boolean {
    return this._newHomeDesignParentFlag;
  }

  public set newHomeDesignParentFlag(value: boolean) {
    this._newHomeDesignParentFlag = value;
  }

  public get newBenchmarksDataArea(): boolean {
    return this._newDataAreaFlag;
  }

  public set newBenchmarksDataArea(value: boolean) {
    this._newDataAreaFlag = value;
  }
}
