import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadMissingGuard implements CanActivate {
  constructor(
    private bulkUploadService: BulkUploadService,
    private establishmentService: EstablishmentService,
    private router: Router,
  ) {}

  canActivate(): Observable<boolean> {
    const workplaceID = this.establishmentService.primaryWorkplace
      ? this.establishmentService.primaryWorkplace.uid
      : this.establishmentService.establishmentId;

    return this.bulkUploadService.getMissingRef(workplaceID).pipe(
      map((response) => {
        if (response.establishment > 0 || response.worker > 0) {
          this.router.navigate(['/dev', 'bulk-upload', 'missing']);
          return false;
        }
        return true;
      }),
    );
  }
}
