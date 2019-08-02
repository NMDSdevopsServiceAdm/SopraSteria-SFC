import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BulkUploadGuard implements CanActivate {
  constructor(
    private bulkUploadService: BulkUploadService,
    private establishmentService: EstablishmentService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.bulkUploadService.getNullLocalIdentifiers(this.establishmentService.primaryWorkplace.uid).pipe(
      map(response => {
        if (response.establishments.length > 0) {
          this.router.navigate(['bulk-upload', 'start']);
          return false;
        }
        return true;
      })
    );
  }
}
