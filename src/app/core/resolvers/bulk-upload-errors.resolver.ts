import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';
import { of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { ErrorReport } from '@core/model/bulk-upload.model';
import {BulkUploadService} from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Injectable()
export class BulkUploadErrorsResolver implements Resolve<any> {
  constructor(private router: Router, private bulkUploadService: BulkUploadService,private establishmentService:EstablishmentService) {}

  resolve(route: ActivatedRouteSnapshot) {

    const workplaceId = this.establishmentService.establishmentId;
    return this.bulkUploadService.errorReport(workplaceId).pipe(
      catchError(() => {
        this.router.navigate(['/bulk-upload'], { fragment: '' });
        return of(null);
      }),
    );
  }
}
