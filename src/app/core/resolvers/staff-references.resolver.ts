import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';
import { of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class StaffReferencesResolver implements Resolve<any> {
  constructor(private router: Router, private workerService: WorkerService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const establishmentUUID = route.paramMap.get('uid');

    if (establishmentUUID) {
      return this.workerService.getAllWorkers(establishmentUUID).pipe(
        take(1),
        catchError(() => {
          this.router.navigate(['/bulk-upload']);
          return of(null);
        }),
      );
    }
  }
}
