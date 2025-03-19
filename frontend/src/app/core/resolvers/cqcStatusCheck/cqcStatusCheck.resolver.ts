import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class CqcStatusCheckResolver  {
  constructor(private establishmentService: EstablishmentService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const { locationId, postcode, mainService } = this.establishmentService.primaryWorkplace;

    if (locationId) {
      return this.establishmentService
        .getCQCRegistrationStatus(locationId, {
          postcode,
          mainService: mainService.name,
        })
        .pipe(
          tap(({ cqcStatusMatch }) => {
            this.establishmentService.setCheckCQCDetailsBanner(cqcStatusMatch === false);
          }),
        )
        .pipe(
          catchError(() => {
            return of(null);
          }),
        );
    }
  }
}
