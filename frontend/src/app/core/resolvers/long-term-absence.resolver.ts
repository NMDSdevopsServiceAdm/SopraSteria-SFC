import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class LongTermAbsenceResolver implements Resolve<any> {
  constructor(private router: Router, private workerService: WorkerService) {}

  resolve() {
    return this.workerService.getLongTermAbsenceReasons().pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return of(null);
      }),
    );
  }
}
