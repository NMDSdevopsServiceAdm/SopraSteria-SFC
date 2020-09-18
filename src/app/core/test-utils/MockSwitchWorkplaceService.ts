import { Injectable } from '@angular/core';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';

@Injectable()
export class MockSwitchWorkplaceService extends SwitchWorkplaceService {
  public navigateToWorkplace(id, username, nmdsId): void {}
}
