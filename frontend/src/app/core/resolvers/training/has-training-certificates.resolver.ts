import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HasTrainingCertificatesResolver implements Resolve<any> {
  constructor(private establishmentService: EstablishmentService) {}

  resolve() {
    const workplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.establishmentService.workplaceOrSubHasTrainingCertificates(workplaceUid).pipe(
      take(1),
      catchError(() => {
        return of(null);
      }),
    );
  }
}
