import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class MissingMandatoryTrainingResolver implements Resolve<any> {
  constructor(
    private router: Router,
    private trainingService: TrainingService,
    private establishmentService: EstablishmentService,
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = route.paramMap.get('establishmentuid');
    const primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;

    const state = this.router.getCurrentNavigation()?.extras.state;
    const paginationParams = { pageIndex: 0, itemsPerPage: 15 };

    return this.trainingService.getMissingMandatoryTraining(workplaceUid, paginationParams).pipe(
      map((response) => {
        if (response.count > 0) {
          return response;
        } else {
          const redirectUrl = workplaceUid === primaryWorkplaceUid ? ['/dashboard'] : ['/workplace', workplaceUid];
          this.router.navigate(redirectUrl, { fragment: 'training-and-qualifications', replaceUrl: true, state });
          return null;
        }
      }),
      catchError(() => {
        this.router.navigate(['/problem with the service']);
        return of(null);
      }),
    );
  }
}
