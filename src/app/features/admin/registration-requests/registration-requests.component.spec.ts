import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { RegistrationRequestsComponent } from './registration-requests.component';

describe('RegistrationRequestsComponent', () => {
  async function setup() {
    const component = await render(RegistrationRequestsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: SwitchWorkplaceService, useClass: MockSwitchWorkplaceService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
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

  it('should show the pending link with an active attribute and rejected link without an active attribute', async () => {
    const { component } = await setup();

    const pendingLink = component.getByTestId('pendingLink');
    const rejectedLink = component.getByTestId('rejectedLink');

    expect(pendingLink.getAttribute('class')).toContain('active');
    expect(rejectedLink.getAttribute('class')).not.toContain('active');
  });

  it('should show the rejected link with an active attribute when clicked and the pending link without an active attribute', async () => {
    const { component, fixture } = await setup();

    const rejectedLinkAnchor = component.getByTestId('rejectedLinkAnchor');

    fireEvent.click(rejectedLinkAnchor);
    fixture.detectChanges();

    const rejectedLink = component.getByTestId('rejectedLink');
    const pendingLink = component.getByTestId('pendingLink');

    expect(pendingLink.getAttribute('class')).not.toContain('active');
    expect(rejectedLink.getAttribute('class')).toContain('active');
  });

  it('should render the pending and in progess registrations when first loading page', async () => {
    const { component } = await setup();

    const workplace1Name = component.queryByText('Workplace 1');
    const workplace1Postcode = component.queryByText('PO5 3CO');
    const workplace1ParentId = component.queryByText('J234567');
    const workplace1Status = component.queryByText('PENDING');
    const workplace1Created = component.queryByText('23/01/2000');

    const workplace2Name = component.queryByText('Workplace 2');
    const workplace2Postcode = component.queryByText('AS4 8DS');
    const workplace2Status = component.queryByText('IN PROGRESS');
    const workplace2Created = component.queryByText('24/01/2001');

    const workplace3Name = component.queryByText('Workplace 3');
    const workplace3Postcode = component.queryByText('ER4 5XC');
    const workplace3ParentId = component.queryByText('W123456');
    const workplace3Status = component.queryByText('REJECTED');
    const workplace3Created = component.queryByText('25/01/2002');

    expect(workplace1Name).toBeTruthy();
    expect(workplace1Postcode).toBeTruthy();
    expect(workplace1ParentId).toBeTruthy();
    expect(workplace1Status).toBeTruthy();
    expect(workplace1Created).toBeTruthy();

    expect(workplace2Name).toBeTruthy();
    expect(workplace2Postcode).toBeTruthy();
    expect(workplace2Status).toBeTruthy();
    expect(workplace2Created).toBeTruthy();

    expect(workplace3Name).toBeFalsy();
    expect(workplace3Postcode).toBeFalsy();
    expect(workplace3ParentId).toBeFalsy();
    expect(workplace3Status).toBeFalsy();
    expect(workplace3Created).toBeFalsy();
  });

  it('should give status a conditional class for different values', async () => {
    const { component } = await setup();

    const workplace1Status = component.getByText('PENDING');
    const workplace2Status = component.getByText('IN PROGRESS');

    expect(workplace1Status.getAttribute('class')).toContain('govuk-tag--grey');
    expect(workplace2Status.getAttribute('class')).toContain('govuk-tag--blue');
  });

  it('should call the parentId link when clicked', async () => {
    const { component, fixture } = await setup();

    const switchWorkplaceService = TestBed.inject(SwitchWorkplaceService);

    const spy = spyOn(switchWorkplaceService, 'navigateToWorkplace');

    const workplace1ParentId = component.getByTestId('parentId-J234567');
    fireEvent.click(workplace1ParentId);

    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  });
});
