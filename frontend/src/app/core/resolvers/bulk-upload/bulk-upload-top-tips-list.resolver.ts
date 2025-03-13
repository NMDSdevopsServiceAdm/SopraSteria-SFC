import { Injectable } from '@angular/core';

import { BulkUploadTopTip } from '@core/model/bulk-upload-top-tips.model';
import { BulkUploadTopTipsService } from '@core/services/bulk-upload/bulk-upload-top-tips.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class BulkUploadTopTipsListResolver  {
  constructor(private bulkUploadTopTipsService: BulkUploadTopTipsService) {}

  resolve(): Observable<null | BulkUploadTopTip[]> {
    return this.bulkUploadTopTipsService.getTopTipsTitles().pipe(
      take(1),
      catchError(() => {
        return of(null);
      }),
    );
  }
}
