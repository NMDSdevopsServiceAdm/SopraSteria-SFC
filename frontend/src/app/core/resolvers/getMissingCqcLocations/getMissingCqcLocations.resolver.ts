import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GetMissingCqcLocationsResolver implements Resolve<any> {
  constructor(private establishmentService: EstablishmentService) {}

  resolve() {
    const { provId, uid, id } = this.establishmentService.primaryWorkplace;
    return this.establishmentService
      .getMissingCqcLocations({
        provId,
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
