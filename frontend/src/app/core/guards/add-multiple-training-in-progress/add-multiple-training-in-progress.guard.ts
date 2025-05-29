import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { TrainingService } from '@core/services/training.service';

@Injectable({
  providedIn: 'root',
})
export class AddMultipleTrainingInProgressGuard  {
  constructor(private router: Router, private trainingService: TrainingService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.trainingService.addMultipleTrainingInProgress$.value) {
      return true;
    } else {
      this.router.navigate([
        'workplace',
        route.paramMap.get('establishmentuid'),
        'add-multiple-training',
        'select-staff',
      ]);
      return false;
    }
  }
}
