import { Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router, UrlTree } from '@angular/router';

import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Injectable({
  providedIn: 'root',
})
export class RequireWhoCarriesDHAAnswerForSomeWorkersGuard implements CanActivate {
  constructor(
    private delegatedHealthcareActivitiesService: DelegatedHealthcareActivitiesService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  canActivate: CanActivateFn = async (route, _state) => {
    const establishmentUid = this.establishmentService.establishment?.uid ?? route.paramMap.get('establishmentuid');
    const response = await this.delegatedHealthcareActivitiesService
      .getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer(establishmentUid)
      .toPromise();
    const numberOfWorkers = response?.noOfWorkersWhoRequiresAnswer ?? 0;

    if (numberOfWorkers > 0) {
      return true;
    }

    return this.redirectToHome();
  };

  redirectToHome(): UrlTree {
    const isViewingSubAsParent = this.parentSubsidiaryViewService.getViewingSubAsParent();

    const homeUrl = isViewingSubAsParent
      ? `/subsidiary/${this.parentSubsidiaryViewService.getSubsidiaryUid()}/home`
      : '/dashboard#home';

    return this.router.parseUrl(homeUrl);
  }
}
