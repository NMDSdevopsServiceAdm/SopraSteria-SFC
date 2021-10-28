import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class TrainingAndQualificationRecordsResolver implements Resolve<any> {
  constructor(private router: Router, private workerService: WorkerService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.workerService
      .getAllTrainingAndQualificationRecords(route.paramMap.get('establishmentuid'), route.paramMap.get('id'))
      .pipe(
        catchError(() => {
          this.router.navigate(['/problem-with-the-service']);
          return of(null);
        }),
      );
  }
}
