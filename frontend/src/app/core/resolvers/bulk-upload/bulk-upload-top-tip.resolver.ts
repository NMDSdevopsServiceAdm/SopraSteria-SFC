import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { BulkUploadTopTip } from '@core/model/bulk-upload-top-tips.model';
import { BulkUploadTopTipsService } from '@core/services/bulk-upload/bulk-upload-top-tips.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class BulkUploadTopTipResolver implements Resolve<any> {
  constructor(private route: Router, private bulkUploadTopTipsService: BulkUploadTopTipsService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<null | BulkUploadTopTip[]> {
    const topTipSlug = route.paramMap.get('slug');
    if (topTipSlug) {
      return this.bulkUploadTopTipsService.getTopTip(topTipSlug).pipe(
        take(1),
        catchError(() => {
          return of(null);
        }),
      );
    }
  }
}
