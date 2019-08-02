import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PrimaryWorkplaceResolver implements Resolve<any> {
  constructor(private establishmentService: EstablishmentService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = localStorage.getItem('establishmentId');
    if (workplaceUid) {
      return this.establishmentService
        .getEstablishment(workplaceUid)
        .pipe(tap(workplace => this.establishmentService.setPrimaryWorkplace(workplace)));
    }

    return of(null);
  }
}
