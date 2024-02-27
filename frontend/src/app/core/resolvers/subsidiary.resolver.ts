import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SubsidiaryResolver implements Resolve<any> {

  constructor(
    private establishmentService: EstablishmentService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService
  ) { }

  resolve(route: ActivatedRouteSnapshot) {
    const subsidiaryUid = this.parentSubsidiaryViewService.getSubsidiaryUid() ?
      this.parentSubsidiaryViewService.getSubsidiaryUid() :
      route.paramMap.get('establishmentUid');

    if (subsidiaryUid) {
      return this.establishmentService.getEstablishment(subsidiaryUid).pipe(
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

