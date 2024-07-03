import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

export class CQCRegistrationStatusResponse {
  cqcStatusMatch: boolean;
}

@Injectable()
export class CqcStatusCheckResolver  {
  constructor(private establishmentService: EstablishmentService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<CQCRegistrationStatusResponse> {
    const workplaceUid = route.paramMap.get('establishmentuid')
      ? route.paramMap.get('establishmentuid')
      : this.establishmentService.establishmentId;

    return this.establishmentService.getEstablishment(workplaceUid).pipe(
      switchMap(({ locationId, postcode, mainService }) => {
        if (locationId) {
          return this.establishmentService.getCQCRegistrationStatus(locationId, {
            postcode,
            mainService: mainService.name,
          });
        }
        return of(null);
      }),
      catchError(() => {
        return of(null);
      }),
    );
  }
}
