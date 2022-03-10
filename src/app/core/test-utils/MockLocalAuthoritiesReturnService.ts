import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { SetDates } from '../model/admin/local-authorities-return.model';
import { LocalAuthoritiesReturnService } from '../services/admin/local-authorities-return/local-authorities-return.service';

@Injectable()
export class MockLocalAuthoritiesReturnService extends LocalAuthoritiesReturnService {
  public setDates(dates: SetDates): Observable<SetDates> {
    return of({
      laReturnStartDate: new Date('2020-01-01'),
      laReturnEndDate: new Date('2002-02-02'),
    } as SetDates);
  }
}
