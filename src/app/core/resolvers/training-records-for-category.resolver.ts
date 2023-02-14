import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class TrainingRecordsForCategoryResolver implements Resolve<any> {
  constructor(
    private router: Router,
    private trainingCategoryService: TrainingCategoryService,
    private establishmentService: EstablishmentService,
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = route.paramMap.get('establishmentuid');
    const trainingId = +route.paramMap.get('categoryId');

    const paginationParams = { pageIndex: 0, itemsPerPage: 15, sortBy: 'trainingExpired' };

    return this.trainingCategoryService.getTrainingCategory(workplaceUid, trainingId, paginationParams).pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return of(null);
      }),
    );
  }
}
