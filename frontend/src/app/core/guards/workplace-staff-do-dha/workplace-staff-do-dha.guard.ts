import { Injectable } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';

@Injectable({
  providedIn: 'root',
})
export class WorkplaceStaffDoDHAGuard {
  constructor(
    private establishmentService: EstablishmentService,
    private router: Router,
  ) {}

  canActivate: CanActivateFn = async (_route, state) => {
    const doDHAAnswer = this.establishmentService?.establishment?.staffDoDelegatedHealthcareActivities;

    if (doDHAAnswer === "Yes") {
      return true;
    }

    return this.redirectToDoDHAQuestion(state);
  };

  redirectToDoDHAQuestion(state: RouterStateSnapshot): UrlTree {
    const whatDHAQuestionUrl = state.url;
    const staffDoDHAQuestionUrl = whatDHAQuestionUrl.replace(
      'what-kind-of-delegated-healthcare-activities',
      'staff-do-delegated-healthcare-activities',
    );
    return this.router.parseUrl(staffDoDHAQuestionUrl);
  }
}
