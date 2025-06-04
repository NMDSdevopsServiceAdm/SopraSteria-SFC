import { Injectable } from '@angular/core';
import { CareWorkforcePathwayWorkplaceAwarenessAnswer } from '@core/model/care-workforce-pathway.model';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { Observable, of } from 'rxjs';

export const careWorkforcePathwayAwarenessAnswers = [
  {
    id: 1,
    title: 'Aware of how the care workforce pathway works in practice',
  },
  {
    id: 2,
    title: 'Aware of the aims of the care workforce pathway',
  },
  {
    id: 3,
    title: "Aware of the term 'care workforce pathway'",
  },
  {
    id: 4,
    title: 'Not aware of the care workforce pathway',
  },
  {
    id: 5,
    title: 'I do not know how aware our workplace is',
  },
];

@Injectable()
export class MockCareWorkforcePathwayService extends CareWorkforcePathwayService {
  getCareWorkforcePathwayWorkplaceAwarenessAnswers(): Observable<CareWorkforcePathwayWorkplaceAwarenessAnswer[]> {
    return of(careWorkforcePathwayAwarenessAnswers);
  }
}
