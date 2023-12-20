import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { TrainingService } from '@core/services/training.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class MandatoryTrainingCategoriesResolver implements Resolve<any> {
  constructor(private router: Router, private trainingService: TrainingService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.trainingService.getAllMandatoryTrainings(route.paramMap.get('establishmentuid')).pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return of(null);
      }),
    );
  }
}
