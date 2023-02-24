import { Injectable } from '@angular/core';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

import { mockConfigCatClient } from './MockConfigCatClient';

@Injectable()
export class MockFeatureFlagsService extends FeatureFlagsService {
  public configCatClient = mockConfigCatClient;

  constructor() {
    super();
    this.configCatClient.getValueAsync = (flagName, defaultSetting) => {
      if (flagName === 'endorsedProvidersLink') {
        return new Promise((resolve) => {
          return resolve(true);
        });
      }
      if (flagName === 'bulkUploadHelp') {
        return new Promise((resolve) => {
          return resolve(true);
        });
      }
      if (flagName === 'wdfUser') {
        return new Promise((resolve) => {
          return resolve(true);
        });
      }

      if (flagName === 'wdfNewDesign') {
        return new Promise((resolve) => {
          return resolve(true);
        });
      }

      if (flagName === 'homePageNewDesign') {
        return new Promise((resolve) => {
          return resolve(false);
        });
      }

      return new Promise((resolve) => {
        return resolve(defaultSetting);
      });
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public start(): void {}
}
