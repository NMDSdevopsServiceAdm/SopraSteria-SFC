import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class WorkerReasonsForLeavingResolver  {
  constructor(private router: Router, private workerService: WorkerService) {}

  resolve() {
    return this.workerService.getLeaveReasons().pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return of(null);
      }),
    );
  }
}
