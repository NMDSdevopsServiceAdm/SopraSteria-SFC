import { Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router, UrlTree } from '@angular/router';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Injectable({
  providedIn: 'root',
})
export class RequireCWPAnswerForSomeWorkersGuard implements CanActivate {
  constructor(
    private careWorkforcePathwayService: CareWorkforcePathwayService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  canActivate: CanActivateFn = async (route, _state) => {
    const establishmentUid = this.establishmentService.establishment?.uid ?? route.paramMap.get('establishmentuid');
    const response = await this.careWorkforcePathwayService
      .getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer(establishmentUid)
      .toPromise();
    const numberOfWorkers = response?.noOfWorkersWhoRequireAnswers ?? 0;

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

// export const RequireCWPAnswerForSomeWorkersGuardOld: CanActivateFn = async (route, _state) => {
//   const careWorkforcePathwayService = inject(CareWorkforcePathwayService);
//   const establishmentService = inject(EstablishmentService);
//   const router = inject(Router);
//   const parentSubsidiaryViewService = inject(ParentSubsidiaryViewService);

//   const establishmentUid = establishmentService.establishment?.uid ?? route.paramMap.get('establishmentuid');
//   const response = await careWorkforcePathwayService
//     .getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer(establishmentUid)
//     .toPromise();
//   const numberOfWorkers = response?.noOfWorkersWhoRequireAnswers ?? 0;

//   if (numberOfWorkers > 0) {
//     return true;
//   }

//   const isViewingSubAsParent = parentSubsidiaryViewService.getViewingSubAsParent();

//   const homeUrl = isViewingSubAsParent
//     ? `/subsidiary/${parentSubsidiaryViewService.getSubsidiaryUid()}/home`
//     : '/dashboard#home';

//   const redirectToHome = router.parseUrl(homeUrl);
//   return redirectToHome;
// };
