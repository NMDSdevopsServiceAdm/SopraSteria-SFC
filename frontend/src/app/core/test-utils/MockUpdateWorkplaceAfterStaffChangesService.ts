import { Injectable } from '@angular/core';
import { UpdateWorkplaceAfterStaffChangesService } from '@core/services/update-workplace-after-staff-changes.service';

@Injectable()
export class MockUpdateWorkplaceAfterStaffChangesService extends UpdateWorkplaceAfterStaffChangesService {
  public static factory(overrides: any = {}) {
    return () => {
      const service = new MockUpdateWorkplaceAfterStaffChangesService();

      Object.keys(overrides).forEach((overrideName) => {
        service[overrideName] = overrides[overrideName];
      });

      return service;
    };
  }
}
