import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubsidiaryResolver  {
  constructor(private parentSubsidiaryViewService: ParentSubsidiaryViewService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const subsidiaryUid = route.paramMap.get('establishmentuid');

    if (subsidiaryUid) {
      this.parentSubsidiaryViewService.setViewingSubAsParent(subsidiaryUid);
    }

    return of(null);
  }
}
