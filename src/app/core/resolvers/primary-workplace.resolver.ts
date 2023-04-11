import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PrimaryWorkplaceResolver implements Resolve<any> {
  constructor(private establishmentService: EstablishmentService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = this.establishmentService.establishmentId;
    // This should include a permissions check, but it doesn't currently: this.permissionsService.can(workplaceUid, 'canViewEstablishment')
    if (workplaceUid) {
      return this.establishmentService.getEstablishment(workplaceUid).pipe(
        tap((workplace) => {
          this.establishmentService.setPrimaryWorkplace(workplace);
          const standAloneAccount = !(workplace?.isParent || workplace?.parentUid);
          this.establishmentService.standAloneAccount = standAloneAccount;
        }),
      );
    }

    return of(null);
  }
}
