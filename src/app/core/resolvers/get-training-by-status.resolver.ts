import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { TrainingService } from '@core/services/training.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class GetTrainingByStatusResolver implements Resolve<any> {
  constructor(private router: Router, private trainingService: TrainingService, private alertService: AlertService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = route.paramMap.get('establishmentuid');
    const status = route.data.training;
    const { state } = this.router.getCurrentNavigation()?.extras;
    const paginationParams = { pageIndex: 0, itemsPerPage: 15 };

    return this.trainingService.getAllTrainingByStatus(workplaceUid, status, paginationParams).pipe(
      map((response) => {
        if (response.trainingCount > 0) {
          return response;
        } else {
          this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications', replaceUrl: true, state });
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
