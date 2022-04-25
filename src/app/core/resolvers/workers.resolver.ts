import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { WorkersResponse } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

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

    const trainingCounts = {
      totalRecords: 0,
      totalExpiredTraining: 0,
      totalExpiringTraining: 0,
      missingMandatoryTraining: 0,
      staffMissingMandatoryTraining: 0,
    };

    this.workerService
      .getAllWorkers(workplaceUid)
      .pipe(take(1))
      .subscribe((result) => {
        result.workers.forEach((worker) => {
          const totalTrainingRecord = worker.trainingCount;
          trainingCounts.totalRecords += totalTrainingRecord + worker.qualificationCount;
          trainingCounts.totalExpiredTraining += worker.expiredTrainingCount;
          trainingCounts.totalExpiringTraining += worker.expiringTrainingCount;
          trainingCounts.missingMandatoryTraining += worker.missingMandatoryTrainingCount;
          if (worker.missingMandatoryTrainingCount > 0) trainingCounts.staffMissingMandatoryTraining += 1;
        });
      });

    const paginationParams = route.data.workerPagination ? { pageIndex: 0, itemsPerPage: 15 } : {};

    return this.workerService.getAllWorkers(workplaceUid, paginationParams).pipe(
      map((response) => ({
        ...response,
        trainingCounts,
      })),
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return of(null);
      }),
    );
  }
}
