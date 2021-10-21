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
                    name: 'Workplace 1',
                    postcode: 'PO5 3CO',
                    parentEstablishmentId: 'J234567',
                    parentUid: 'parentUid',
                    workplaceUid: 'someuid',
                    status: 'PENDING',
                    created: '23/01/2000',
                  },
                  {
                    name: 'Workplace 2',
                    postcode: 'AS4 8DS',
                    parentEstablishmentId: null,
                    workplaceUid: 'anotheruid',
                    status: 'IN PROGRESS',
                    created: '24/01/2001',
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

    const pendingLink = component.getByText('Pending (2)', { exact: false });
    expect(pendingLink.getAttribute('href')).toBe('/sfcadmin/registrations/pending');
  });

  it('should contain a rejected link that links to sfcadmin/registrations/rejected url', async () => {
    const { component } = await setup();

    const registrationsLink = component.getByText('Rejected', { exact: false });
    expect(registrationsLink.getAttribute('href')).toBe('/sfcadmin/registrations/rejected');
  });
});
