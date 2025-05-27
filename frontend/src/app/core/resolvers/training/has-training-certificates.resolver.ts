import { Injectable } from '@angular/core';

import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HasTrainingCertificatesResolver  {
  constructor(private establishmentService: EstablishmentService) {}

  resolve() {
    const workplaceUid = this.establishmentService.primaryWorkplace.uid;

    return this.establishmentService.workplaceOrSubHasTrainingCertificates(workplaceUid).pipe(
      take(1),
      catchError(() => {
        return of(null);
      }),
    );
  }
}
