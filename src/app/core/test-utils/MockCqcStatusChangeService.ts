import { Injectable } from '@angular/core';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { of } from 'rxjs';

@Injectable()
export class MockCqcStatusChangeService extends CqcStatusChangeService {
  public getCqcRequestByEstablishmentId() {
    return of(null);
  }
}
