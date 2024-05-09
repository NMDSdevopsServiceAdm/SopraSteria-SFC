import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubsidiaryResolver implements Resolve<any> {
  constructor(private parentSubsidiaryViewService: ParentSubsidiaryViewService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const subsidiaryUid = route.paramMap.get('establishmentuid');

    if (subsidiaryUid) {
      this.parentSubsidiaryViewService.setViewingSubAsParent(subsidiaryUid);
    }

    return of(null);
  }
}
