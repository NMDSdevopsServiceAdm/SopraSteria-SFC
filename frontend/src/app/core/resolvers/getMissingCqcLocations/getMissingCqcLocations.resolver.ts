import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class GetMissingCqcLocationsResolver implements Resolve<any> {
  constructor(private establishmentService: EstablishmentService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const { locationId, uid, id } = this.establishmentService.primaryWorkplace;
    return this.establishmentService
      .getMissingCqcLocations({
        locationId,
        uid,
        id,
      })
      .pipe(
        catchError(() => {
          return of(null);
        }),
      );
  }
}
