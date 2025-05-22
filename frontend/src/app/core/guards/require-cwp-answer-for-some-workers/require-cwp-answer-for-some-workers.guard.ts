import { CanActivateFn, Router } from '@angular/router';
import { CareWorkforcePathwayService } from '../../services/care-workforce-pathway.service';
import { inject } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentSubsidiaryViewService } from '../../../shared/services/parent-subsidiary-view.service';

export const RequireCWPAnswerForSomeWorkersGuard: CanActivateFn = async (route, _state) => {
  const careWorkforcePathwayService = inject(CareWorkforcePathwayService);
  const establishmentService = inject(EstablishmentService);
  const router = inject(Router);
  const parentSubsidiaryViewService = inject(ParentSubsidiaryViewService);

  const establishmentUid = establishmentService.establishment?.uid ?? route.paramMap.get('establishmentuid');
  const response = await careWorkforcePathwayService
    .getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer(establishmentUid)
    .toPromise();
  const numberOfWorkers = response?.noOfWorkersWhoRequireAnswers ?? 0;

  if (numberOfWorkers > 0) {
    return true;
  }

  const isViewingSubAsParent = parentSubsidiaryViewService.getViewingSubAsParent();

  const homeUrl = isViewingSubAsParent
    ? `/subsidiary/${parentSubsidiaryViewService.getSubsidiaryUid()}/home`
    : '/dashboard#home';

  const redirectToHome = router.parseUrl(homeUrl);
  return redirectToHome;
};
