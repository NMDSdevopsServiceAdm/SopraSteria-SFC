import { Injectable } from '@angular/core';
import { CareWorkforcePathwayService } from '../services/care-workforce-pathway.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CareWorkforcePathwayUseReason } from '@core/model/care-workforce-pathway.model';

@Injectable()
export class CareWorkforcePathwayUseReasonsResolver {
  constructor(private careWorkforcePathwayService: CareWorkforcePathwayService) {}
  resolve(): Observable<CareWorkforcePathwayUseReason[]> {
    return this.careWorkforcePathwayService
      .getAllCareWorkforcePathwayUseReasons()
      .pipe(map((response) => response.allReasons));
  }
}
