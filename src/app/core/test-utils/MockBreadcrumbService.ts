import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';

@Injectable()
export class MockBreadcrumbService extends AuthService {
  public show(journey: JourneyType): any {
    return {};
  }
}
