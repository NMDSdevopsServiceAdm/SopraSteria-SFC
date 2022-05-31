import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { JobService } from '@core/services/job.service';
import { of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class JobsResolver implements Resolve<any> {
  constructor(private router: Router, private jobService: JobService) {}

  resolve() {
    return this.jobService
      .getJobs()
      .pipe(take(1))
      .pipe(
        catchError(() => {
          this.router.navigate(['/problem-with-the-service']);
          return of(null);
        }),
      );
  }
}
