import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { RegistrationRequestsComponent } from './registration-requests.component';

describe('RegistrationRequestsComponent', () => {
  async function setup() {
    const component = await render(RegistrationRequestsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                registrations: [
                  {
                    establishment: {
                      name: 'Workplace 1',
                      postcode: 'PO5 3CO',
                      parentEstablishmentId: 'J234567',
                      parentUid: 'parentUid',
                      uid: 'someuid',
                      status: 'PENDING',
                    },
                    created: '23/01/2000',
                  },
                  {
                    establishment: {
                      name: 'Workplace 2',
                      postcode: 'AS4 8DS',
                      parentEstablishmentId: null,
                      uid: 'anotheruid',
                      status: 'IN PROGRESS',
                    },
                    created: '24/01/2001',
                  },
                  {
                    establishment: {
                      name: 'Workplace 3',
                      postcode: 'ER4 5XC',
                      parentEstablishmentId: 'W123456',
                      parentUid: 'anotherParentUid',
                      uid: 'uiduid',
                      status: 'REJECTED',
                    },
                    created: '25/01/2002',
                  },
                ],
              },
            },
          },
        },
      ],
    });

    const fixture = component.fixture;

    return {
      component,
      fixture,
    };
  }

  it('should render a RegistrationRequestsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should contain a pending link that links to sfcadmin/registrations/pending url', async () => {
    const { component } = await setup();

    const pendingLink = component.getByText('Pending', { exact: false });
    expect(pendingLink.getAttribute('href')).toBe('/sfcadmin/registrations/pending');
  });

  it('should contain a rejected link that links to sfcadmin/registrations/rejected url', async () => {
    const { component } = await setup();

    const registrationsLink = component.getByText('Rejected', { exact: false });
    expect(registrationsLink.getAttribute('href')).toBe('/sfcadmin/registrations/rejected');
  });
});
