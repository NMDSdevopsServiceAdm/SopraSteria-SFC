import { Injectable } from '@angular/core';

import { BulkUploadService } from '@core/services/bulk-upload.service';
import { take } from 'rxjs/operators';
import { EstablishmentService } from '@core/services/establishment.service';

@Injectable()
export class MissingWorkplacesReferencesResolver  {
  constructor(private bulkUploadService: BulkUploadService,private establishmentService: EstablishmentService) {}

  resolve() {
    return this.bulkUploadService.getMissingRef(this.establishmentService.establishmentId).pipe(take(1));
  }
}
