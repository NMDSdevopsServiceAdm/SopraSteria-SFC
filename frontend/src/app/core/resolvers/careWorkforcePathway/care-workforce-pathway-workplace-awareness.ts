import { Injectable } from '@angular/core';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { CareWorkforcePathwayWorkplaceAwareness } from '@core/model/establishment.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class CareWorkforcePathwayWorkplaceAwarenessAnswersResolver {
  constructor(private careWorkforcePathwayService: CareWorkforcePathwayService) {}
  resolve(): Observable<CareWorkforcePathwayWorkplaceAwareness[]> {
    return this.careWorkforcePathwayService.getCareWorkforcePathwayWorkplaceAwarenessAnswers().pipe(
      catchError(() => {
        return of(null);
      }),
    );
  }
}
