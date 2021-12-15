import { Injectable } from '@angular/core';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { build } from '@jackfranklin/test-data-bot';
import { of } from 'rxjs';

export const PendingApproval = build('PendingApproval', {
  fields: {
    status: 'Pending',
    requestUid: 'bbd54f18-f0bd-4fc2-893d-e492faa9b278',
    createdAt: '01/02/2020',
    username: 'John Doe',
    establishment: {
      status: 'Pending',
      inReview: false,
      reviewer: null,
      establishmentId: 1,
      establishmentUid: 'f61696f7-30fe-441c-9c59-e25dfcb51f59',
      workplaceId: 'J111111',
      name: 'Workplace 1',
      address1: 'Care Home 1',
      address2: '31 King Street',
      address3: 'Sale',
      town: 'Manchester',
      county: 'Cheshire',
      postcode: 'CA1 2BD',
    },
    data: {
      requestedService: {
        id: 1,
        name: 'Carers support',
        other: null,
      },
      currentService: {
        id: 14,
        name: 'Any childrens / young peoples services',
        other: 'Other Name',
      },
    },
  },
});
export const InProgressApproval = (reviewer) => {
  return PendingApproval({
    overrides: {
      status: 'In progress',
      establishment: {
        status: 'In progress',
        inReview: true,
        reviewer: reviewer,
        establishmentId: 1,
        establishmentUid: 'f61696f7-30fe-441c-9c59-e25dfcb51f59',
        workplaceId: 'J111111',
        name: 'Workplace 1',
        address1: 'Care Home 1',
        address2: '31 King Street',
        address3: 'Sale',
        town: 'Manchester',
        county: 'Cheshire',
        postcode: 'CA1 2BD',
      },
    },
  });
};

@Injectable()
export class MockCqcStatusChangeService extends CqcStatusChangeService {
  public getCqcRequestByEstablishmentId() {
    return of(null);
  }
}
