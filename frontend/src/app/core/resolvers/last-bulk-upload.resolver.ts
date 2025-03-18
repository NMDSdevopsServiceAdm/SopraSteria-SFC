import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EstablishmentService } from '@core/services/establishment.service';

@Injectable()
export class LastBulkUploadResolver  {
  constructor(private router: Router, private bulkUploadService: BulkUploadService,private establishmentService: EstablishmentService) {}
  resolve(route: ActivatedRouteSnapshot) {
    const establishmentId = this.establishmentService.establishmentId;

    return this.bulkUploadService.getLastBulkUpload(establishmentId).pipe(
      catchError(() => {
        this.router.navigate(['/bulk-upload'], { fragment: '' });
        return of(null);
      }),
    );
  }
}
