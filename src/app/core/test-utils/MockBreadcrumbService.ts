import { Injectable } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Injectable()
export class MockBreadcrumbService extends BreadcrumbService {
  public show(journey: JourneyType): any {
    return {};
  }
}
