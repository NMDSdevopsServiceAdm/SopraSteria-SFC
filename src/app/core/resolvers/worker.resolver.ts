import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class WorkerResolver implements Resolve<any> {
  constructor(
    private router: Router,
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.workerService.getWorker(this.establishmentService.establishmentId, route.paramMap.get('id')).pipe(
      catchError(() => {
        this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
        return of(null);
      }),
    );
  }
}
