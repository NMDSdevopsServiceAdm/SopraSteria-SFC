import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadStartGuard implements CanActivate {
  constructor(
    private bulkUploadService: BulkUploadService,
    private establishmentService: EstablishmentService,
    private router: Router,
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    const workplaceID = this.establishmentService.primaryWorkplace
      ? this.establishmentService.primaryWorkplace.uid
      : this.establishmentService.establishmentId;

    return this.bulkUploadService.isFirstBulkUpload(workplaceID).pipe(
      map((response) => {
        if (response.isFirstBulkUpload) {
          const redirect: UrlTree = this.router.parseUrl('/bulk-upload/start');
          return redirect;
        }
        return true;
      }),
    );
  }
}
