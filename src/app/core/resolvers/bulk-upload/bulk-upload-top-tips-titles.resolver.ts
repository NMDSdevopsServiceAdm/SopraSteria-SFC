import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { BulkUploadTopTipsService } from '@core/services/bulk-upload/bulk-upload-top-tips.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class BulkUploadTopTipsTitlesResolver implements Resolve<any> {
  constructor(private bulkUploadTopTipsService: BulkUploadTopTipsService) {}

  resolve(): Observable<null | any> {
    return this.bulkUploadTopTipsService.getTopTipsTitles().pipe(
      take(1),
      catchError(() => {
        return of(null);
      }),
    );
  }
}
