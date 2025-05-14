import { Injectable } from '@angular/core';
import { CareWorkforcePathwayRoleCategory } from '@core/model/careWorkforcePathwayCategory.model';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { Observable, of } from 'rxjs';

export const careWorkforcePathwayRoleCategories = [
  {
    id: 1,
    title: 'New to care',
    description: "Is in a care-providing role that's a start point for a career in social care",
  },
  {
    id: 2,
    title: 'Care or support worker',
    description: "Is established in their role, they've consolidated their skills and experience",
  },
  {
    id: 101,
    title: 'I do not know',
    description: null,
  },
];

@Injectable()
export class MockCareWorkforcePathwayService extends CareWorkforcePathwayService {
  getCareWorkforcePathwayRoleCategories(): Observable<CareWorkforcePathwayRoleCategory[]> {
    return of(careWorkforcePathwayRoleCategories);
  }
}
