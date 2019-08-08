import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { take } from 'rxjs/operators';

@Injectable()
export class WorkplacesReferencesResolver implements Resolve<any> {
  constructor(private bulkUploadService: BulkUploadService) {}

  resolve() {
    return this.bulkUploadService.workPlaceReferences$.pipe(take(1));
  }
}
