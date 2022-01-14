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
    const lastUrlSegmentIndex = route.url.length - 1;
    const bulkUploadTroubleshootingPageSlug = route.url[lastUrlSegmentIndex].path;

    if (bulkUploadTroubleshootingPageSlug) {
      return this.bulkUploadTroubleshootingPagesService
        .getBulkUploadTroubleshootingPage(bulkUploadTroubleshootingPageSlug)
        .pipe(
          take(1),
          catchError(() => {
            return of(null);
          }),
        );
    }
  }
}
