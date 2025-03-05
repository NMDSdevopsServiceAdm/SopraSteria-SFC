import { Injectable } from '@angular/core';

import { BulkUploadService } from '@core/services/bulk-upload.service';
import { take } from 'rxjs/operators';

@Injectable()
export class WorkplacesReferencesResolver  {
  constructor(private bulkUploadService: BulkUploadService) {}

  resolve() {
    return this.bulkUploadService.workPlaceReferences$.pipe(take(1));
  }
}
