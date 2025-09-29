import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface ResolvedData {
  hasAnyTrainingOrQualifications: boolean;
}
@Injectable()
export class WorkerHasAnyTrainingOrQualificationsResolver {
  constructor(private router: Router, private workerService: WorkerService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ResolvedData> {
    return this.workerService
      .workerHasAnyTrainingOrQualifications(route.paramMap.get('establishmentuid'), route.paramMap.get('id'))
      .pipe(
        catchError(() => {
          this.router.navigate(['/problem-with-the-service']);
          return of(null);
        }),
      );
  }
}
