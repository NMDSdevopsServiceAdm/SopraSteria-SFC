import { Injectable } from '@angular/core';
import { UpdateWorkplaceService } from '@core/services/update-workplace.service';

@Injectable()
export class MockUpdateWorkplaceService extends UpdateWorkplaceService {
  public static factory(overrides: any = {}) {
    return () => {
      const service = new MockUpdateWorkplaceService();

      Object.keys(overrides).forEach((overrideName) => {
        service[overrideName] = overrides[overrideName];
      });

      return service;
    };
  }
}
