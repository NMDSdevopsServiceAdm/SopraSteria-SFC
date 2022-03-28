import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { WorkersResponse } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class WorkersResolver implements Resolve<any> {
  constructor(
    private router: Router,
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<WorkersResponse | null> {
    const workplaceUid = route.paramMap.get('establishmentuid')
      ? route.paramMap.get('establishmentuid')
      : this.establishmentService.establishmentId;

    if (!this.permissionsService.can(workplaceUid, 'canViewListOfWorkers')) return of(null);

    return this.workerService.getAllWorkers(workplaceUid, { pageIndex: 0, itemsPerPage: 15 }).pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return of(null);
      }),
    );
  }
}
