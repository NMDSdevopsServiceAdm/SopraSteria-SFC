import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class TotalStaffRecordsResolver implements Resolve<any> {
  constructor(
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Array<UserDetails> | null> {
    const workplaceUid = route.paramMap.get('establishmentuid')
      ? route.paramMap.get('establishmentuid')
      : this.establishmentService.establishmentId;

    if (!this.permissionsService.can(workplaceUid, 'canViewListOfWorkers')) return of(null);

    return this.workerService.getTotalStaffRecords(workplaceUid).pipe(
      catchError(() => {
        return of(null);
      }),
    );
  }
}
