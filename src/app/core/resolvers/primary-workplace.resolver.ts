import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PrimaryWorkplaceResolver implements Resolve<any> {
  constructor(private establishmentService: EstablishmentService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceid = localStorage.getItem('establishmentId');
    if (workplaceid) {
      return this.establishmentService
        .getEstablishment(workplaceid)
        .pipe(tap(workplace => (this.establishmentService.primaryWorkplace$ = workplace)));
    }

    return of(null);
  }
}
