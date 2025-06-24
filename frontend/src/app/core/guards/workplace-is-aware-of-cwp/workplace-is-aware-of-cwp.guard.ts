import { Injectable } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { CareWorkforcePathwayService } from '../../services/care-workforce-pathway.service';

@Injectable({
  providedIn: 'root',
})
export class WorkplaceIsAwareOfCwpGuard {
  constructor(
    private establishmentService: EstablishmentService,
    private careWorkforcePathwayService: CareWorkforcePathwayService,
    private router: Router,
  ) {}

  canActivate: CanActivateFn = async (_route, state) => {
    const awarenessAnswer = this.establishmentService?.establishment?.careWorkforcePathwayWorkplaceAwareness;
    const workplaceIsAwareOfCWP = this.careWorkforcePathwayService.isAwareOfCareWorkforcePathway(awarenessAnswer);
    if (workplaceIsAwareOfCWP) {
      return true;
    }

    return this.redirectToCWPAwarenessQuestion(state);
  };

  redirectToCWPAwarenessQuestion(state: RouterStateSnapshot): UrlTree {
    const cwpUseQuestionUrl = state.url;
    const awarenessQuestionUrl = cwpUseQuestionUrl.replace(
      'care-workforce-pathway-use',
      'care-workforce-pathway-awareness',
    );
    return this.router.parseUrl(awarenessQuestionUrl);
  }
}
