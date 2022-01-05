import { Injectable } from '@angular/core';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

import { mockConfigCatClient } from './MockConfigCatClient';

@Injectable()
export class MockFeatureFlagsService extends FeatureFlagsService {
  public configCatClient = mockConfigCatClient;

  constructor() {
    super();
    this.configCatClient.getValueAsync = (flagName, defaultSetting) => {
      if (flagName === 'newTrainingAndQualificationsRecords') {
        return new Promise((resolve) => {
          return resolve(true);
        });
      }
      if (flagName === 'newTrainingAndQualificationsReport') {
        return new Promise((resolve) => {
          return resolve(true);
        });
      }
      if (flagName === 'parentTrainingAndQualificationsReport') {
        return new Promise((resolve) => {
          return resolve(true);
        });
      }
      if (flagName === 'endorsedProvidersLink') {
        return new Promise((resolve) => {
          return resolve(true);
        });
      }
      if (flagName === 'benefitsBundle') {
        return new Promise((resolve) => {
          return resolve(true);
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
