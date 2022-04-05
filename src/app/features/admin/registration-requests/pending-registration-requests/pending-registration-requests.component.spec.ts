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

import { PendingRegistrationRequestsComponent } from './pending-registration-requests.component';

describe('PendingRegistrationRequestsComponent', () => {
  async function setup() {
    const component = await render(PendingRegistrationRequestsComponent, {
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
                    name: 'Workplace 1',
                    postcode: 'PO5 3CO',
                    parentEstablishmentId: 'J234567',
                    parentId: 'parentId',
                    parentUid: 'parentUid',
                    workplaceUid: 'someuid',
                    status: 'PENDING',
                    created: new Date('01/01/2021'),
                  },
                  {
                    name: 'Workplace 2',
                    postcode: 'AS4 8DS',
                    parentEstablishmentId: null,
                    workplaceUid: 'anotheruid',
                    status: 'IN PROGRESS',
                    created: new Date('02/01/2021'),
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

  it('should render a PendingRegistrationRequestsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the pending and in progess registrations when first loading page', async () => {
    const { component } = await setup();

    const workplace1Name = component.queryByText('Workplace 1');
    const workplace1Postcode = component.queryByText('PO5 3CO');
    const workplace1ParentId = component.queryByText('J234567');
    const workplace1Status = component.queryByText('PENDING');
    const workplace1Created = component.queryByText('01 Jan 2021 00:00');

    const workplace2Name = component.queryByText('Workplace 2');
    const workplace2Postcode = component.queryByText('AS4 8DS');
    const workplace2Status = component.queryByText('IN PROGRESS');
    const workplace2Created = component.queryByText('01 Feb 2021 00:00');

    expect(workplace1Name).toBeTruthy();
    expect(workplace1Postcode).toBeTruthy();
    expect(workplace1ParentId).toBeTruthy();
    expect(workplace1Status).toBeTruthy();
    expect(workplace1Created).toBeTruthy();

    expect(workplace2Name).toBeTruthy();
    expect(workplace2Postcode).toBeTruthy();
    expect(workplace2Status).toBeTruthy();
    expect(workplace2Created).toBeTruthy();
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
