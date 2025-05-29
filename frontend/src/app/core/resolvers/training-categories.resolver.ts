import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class TrainingCategoriesResolver  {
  constructor(private router: Router, private trainingCategoryService: TrainingCategoryService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.trainingCategoryService.getCategories().pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return of(null);
      }),
    );
  }
}
