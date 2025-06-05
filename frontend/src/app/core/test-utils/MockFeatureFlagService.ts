import { Injectable } from '@angular/core';

import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { mockConfigCatClient } from './MockConfigCatClient';

@Injectable()
export class MockFeatureFlagsService extends FeatureFlagsService {
  public configCatClient = mockConfigCatClient;

  constructor() {
    super();
  }
  public static factory(override: Record<string, boolean>) {
    return () => {
      const service = new MockFeatureFlagsService();
      if (override) {
        service.configCatClient.getValueAsync = async (flagName, defaultSetting) => {
          return override?.[flagName] ?? defaultSetting;
        };
      }
      return service;
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async start(): Promise<void> {}
}
