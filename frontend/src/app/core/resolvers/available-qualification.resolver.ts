import { of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AvailableQualificationsResponse } from '@core/model/qualification.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

@Injectable()
export class AvailableQualificationsResolver  {
  constructor(
    private router: Router,
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<AvailableQualificationsResponse[]> {
    const workplaceUid = route.paramMap.get('establishmentuid') || this.establishmentService.establishmentId;
    const workerUid = route.paramMap.get('id') || this.workerService.worker.uid;

    return this.workerService.getAllAvailableQualifications(workplaceUid, workerUid).pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return of(null);
      }),
    );
  }
}
