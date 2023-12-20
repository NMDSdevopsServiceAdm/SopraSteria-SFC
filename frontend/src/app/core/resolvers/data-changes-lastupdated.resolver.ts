import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { DataChangeService } from '@core/services/data-change.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class DataChangeLastUpdatedResolver implements Resolve<any> {
  constructor(private dataChangeService: DataChangeService, private establishmentService: EstablishmentService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const establishmentId = this.establishmentService.establishmentId;
    return this.dataChangeService.getDataChangesLastUpdate(establishmentId).pipe(
      take(1),
      catchError(() => {
        return of(null);
      }),
    );
  }
}
