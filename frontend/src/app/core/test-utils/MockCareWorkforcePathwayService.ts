import lodash from 'lodash';
import { Observable, of } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CareWorkforcePathwayWorkplaceAwarenessAnswer } from '@core/model/care-workforce-pathway.model';
import { CareWorkforcePathwayUseReason } from '@core/model/care-workforce-pathway.model';
import { CareWorkforcePathwayRoleCategory } from '@core/model/careWorkforcePathwayCategory.model';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';

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

export const MockCWPUseReasons: Array<CareWorkforcePathwayUseReason> = [
  { id: 1, text: "To help define our organisation's values", isOther: false },
  { id: 2, text: 'To help update our job descriptions', isOther: false },
  { id: 10, text: 'For something else', isOther: true },
];

@Injectable()
export class MockCareWorkforcePathwayService extends CareWorkforcePathwayService {
  getCareWorkforcePathwayRoleCategories(): Observable<CareWorkforcePathwayRoleCategory[]> {
    return of(careWorkforcePathwayRoleCategories);
  }

  getCareWorkforcePathwayWorkplaceAwarenessAnswers(): Observable<CareWorkforcePathwayWorkplaceAwarenessAnswer[]> {
    return of(careWorkforcePathwayAwarenessAnswers);
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
