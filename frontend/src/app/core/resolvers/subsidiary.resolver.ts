import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SubsidiaryResolver implements Resolve<any> {
  constructor(
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private establishmentService: EstablishmentService,
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    const subsidiaryUid = route.paramMap.get('establishmentuid');

    if (subsidiaryUid) {
      this.parentSubsidiaryViewService.setViewingSubAsParent(subsidiaryUid);

      return this.establishmentService.getEstablishment(subsidiaryUid).pipe(
        tap((workplace) => {
          this.establishmentService.setWorkplace(workplace);
        }),
      );
    }

    return of(null);
  }
}
