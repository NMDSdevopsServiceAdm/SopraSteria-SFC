import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Injectable()
export class BulkUploadErrorsResolver  {
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
