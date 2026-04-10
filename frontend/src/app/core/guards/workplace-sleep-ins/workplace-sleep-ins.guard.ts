import { Injectable } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';

@Injectable({
  providedIn: 'root',
})
export class WorkplaceSleepInsGuard {
  constructor(private establishmentService: EstablishmentService, private router: Router) {}

  canActivate: CanActivateFn = async (_route, state) => {
    const offerSleepInAnswer = this.establishmentService?.establishment?.offerSleepIn;

    if (offerSleepInAnswer === 'Yes') {
      return true;
    }

    return this.redirectToSleepInsQuestion(state);
  };

  redirectToSleepInsQuestion(state: RouterStateSnapshot): UrlTree {
    const howToPaySleepInsQuestionUrl = state.url;

    const offerSleepInsQuestionUrl = howToPaySleepInsQuestionUrl.replace(
      'how-do-you-pay-for-sleep-ins',
      'workplace-offer-sleep-ins',
    );
    return this.router.parseUrl(offerSleepInsQuestionUrl);
  }
}
