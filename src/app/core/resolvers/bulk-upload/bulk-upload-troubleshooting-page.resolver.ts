import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { BulkUploadTroubleshootingPage } from '@core/model/bulk-upload-troubleshooting-page.model';
import { BulkUploadTroubleshootingPagesService } from '@core/services/bulk-upload/bulkUploadTroubleshootingPages.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class BulkUploadTroubleshootingPageResolver implements Resolve<any> {
  constructor(
    private router: Router,
    private bulkUploadTroubleshootingPagesService: BulkUploadTroubleshootingPagesService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<null | BulkUploadTroubleshootingPage[]> {
    return this.bulkUploadTroubleshootingPagesService.getBulkUploadTroubleshootingPage().pipe(
      take(1),
      catchError(() => {
        return of(null);
      }),
    );
  }
}
