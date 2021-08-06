import { Injectable } from '@angular/core';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

import { mockConfigCatClient } from './MockConfigCatClient';

@Injectable()
export class MockFeatureFlagsService extends FeatureFlagsService {
  public configCatClient = mockConfigCatClient;

  public start(): void {}
}
