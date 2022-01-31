import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class TotalStaffRecordsResolver implements Resolve<any> {
  constructor(private workerService: WorkerService, private establishmentService: EstablishmentService) {}

  resolve(): Observable<Array<UserDetails> | null> {
    const workplaceId = this.establishmentService.establishmentId;

    return this.workerService.getTotalStaffRecords(workplaceId).pipe(
      catchError(() => {
        return of(null);
      }),
    );
  }
}
