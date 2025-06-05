import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CareWorkforcePathwayRoleCategory } from '@core/model/careWorkforcePathwayCategory.model';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { Observable, of } from 'rxjs';
import lodash from 'lodash';

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
  {
    id: 102,
    title: 'None of the above',
    description: 'Select this for admin, ancillary and other roles not yet included in the care workforce pathway',
  },
];

export const MockCWPRoleCategories = lodash.mapValues(
  {
    NewToCare: careWorkforcePathwayRoleCategories[0],
    CareOrSupportWorker: careWorkforcePathwayRoleCategories[1],
    IDoNotKnow: careWorkforcePathwayRoleCategories[2],
    NoneOfTheAbove: careWorkforcePathwayRoleCategories[3],
  },
  (obj) => ({ ...obj, roleCategoryId: obj.id }),
);

@Injectable()
export class MockCareWorkforcePathwayService extends CareWorkforcePathwayService {
  getCareWorkforcePathwayRoleCategories(): Observable<CareWorkforcePathwayRoleCategory[]> {
    return of(careWorkforcePathwayRoleCategories);
  }

  public static factory(overrides: any = {}) {
    return (httpClient: HttpClient) => {
      const service = new MockCareWorkforcePathwayService(httpClient);

      Object.keys(overrides).forEach((overrideName) => {
        service[overrideName] = overrides[overrideName];
      });

      return service;
    };
  }
}
