import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class CQCRegistrationStatusResponse {
  cqcStatusMatch: boolean;
}

@Injectable()
export class CqcStatusCheckResolver implements Resolve<any> {
  constructor(private establishmentService: EstablishmentService) {}

  resolve(): Observable<CQCRegistrationStatusResponse> {
    const { locationId, postcode, mainService } = this.establishmentService.primaryWorkplace;

    if (locationId) {
      return this.establishmentService
        .getCQCRegistrationStatus(locationId, {
          postcode,
          mainService: mainService.name,
        })
        .pipe(
          catchError(() => {
            return of(null);
          }),
        );
    }
  }
}
