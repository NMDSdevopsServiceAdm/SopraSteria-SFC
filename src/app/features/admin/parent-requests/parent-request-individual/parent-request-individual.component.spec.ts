import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { WindowRef } from '@core/services/window.ref';
import { InProgressApproval, PendingApproval } from '@core/test-utils/admin/MockParentRequestIndividtalual';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockRegistrationsService } from '@core/test-utils/MockRegistrationsService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of, throwError } from 'rxjs';

import { ParentRequestIndividualComponent } from './parent-request-individual.component';

describe('ParentRequestIndividualComponent', () => {
  const notes = [
    {
      createdAt: new Date('01/09/2021'),
      note: 'Note about the parent request',
      user: { FullNameValue: 'adminUser' },
    },
    {
      createdAt: new Date('05/09/2021'),
      note: 'Another note about the parent request',
      user: { FullNameValue: 'adminUser' },
    },
  ];

  async function setup(inProgress = false, reviewer = null, existingNotes = false) {
    const { fixture, getByText, queryByText, getByTestId, queryByTestId, getAllByText, queryAllByText } = await render(
      ParentRequestIndividualComponent,
      {
        imports: [
          SharedModule,
          RouterModule,
          RouterTestingModule.withRoutes([
            { path: 'sfcadmin/parent-requests', component: ParentRequestIndividualComponent },
          ]),
          HttpClientTestingModule,
          FormsModule,
          ReactiveFormsModule,
        ],
        providers: [
          WindowRef,
          { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
          { provide: SwitchWorkplaceService, useClasee: MockSwitchWorkplaceService },
          { provide: RegistrationsService, useClass: MockRegistrationsService },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                data: {
                  loggedInUser: { fullname: 'adminUser', uid: '123' },
                  parentRequestsIndividual: inProgress ? InProgressApproval(reviewer) : PendingApproval(),
                  notes: existingNotes && notes,
                },
              },
            },
          },
        ],
      },
    );

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      queryAllByText,
      getByText,
      queryByText,
      getByTestId,
      getAllByText,
      queryByTestId,
    };
  }

  it('should render a ParentRequestIndividualComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the workplace name twice (heading and name section)', async () => {
    const { queryAllByText, component } = await setup();

    const workplaceName = component.registration.establishment.name;
    expect(queryAllByText(workplaceName, { exact: false }).length).toBe(2);
  });

  it('should display the workplace ID and call the navigateToWorkplace function when clicked', async () => {
    const { getByText, fixture, component } = await setup();
    const workplaceId = component.registration.establishment.workplaceId;

    const switchWorkplaceService = TestBed.inject(SwitchWorkplaceService);
    const switchWorkplaceSpy = spyOn(switchWorkplaceService, 'navigateToWorkplace');

    const workplaceIdLink = getByText(workplaceId, { exact: false });
    fireEvent.click(workplaceIdLink);

    fixture.detectChanges();

    expect(workplaceIdLink).toBeTruthy();
    expect(switchWorkplaceSpy).toHaveBeenCalled();
  });

  it('should display the workplace address', async () => {
    const { getByText, component } = await setup();

    const address1 = component.registration.establishment.address1;
    const address2 = component.registration.establishment.address2;
    const address3 = component.registration.establishment.address3;
    const postcode = component.registration.establishment.postcode;
    const town = component.registration.establishment.town;
    const county = component.registration.establishment.county;
    console.log(address3);

    expect(getByText(address1, { exact: false })).toBeTruthy();
    expect(getByText(address2, { exact: false })).toBeTruthy();
    expect(getByText(address3, { exact: false })).toBeTruthy();
    expect(getByText(postcode, { exact: false })).toBeTruthy();
    expect(getByText(town, { exact: false })).toBeTruthy();
    expect(getByText(county, { exact: false })).toBeTruthy();
  });

  it('should display the username', async () => {
    const { getByText, component } = await setup();
    const username = component.registration.username;

    expect(getByText(username, { exact: false })).toBeTruthy();
  });

  describe('Checkbox componenet', () => {
    it('should show a PENDING banner when no one is reviewing the registration', async () => {
      const { queryByText } = await setup();

      const pendingBanner = queryByText('PENDING');
      expect(pendingBanner).toBeTruthy();
    });

    it('should show a checkbox when no one is reviewing the registration', async () => {
      const { getByTestId } = await setup();
      const checkbox = getByTestId('reviewingRegistrationCheckbox');

      expect(checkbox).toBeTruthy();
    });

    it('should show an IN PROGRESS banner and checkbox when you are reviewing the registration', async () => {
      const inProgress = true;
      const reviewer = 'adminUser';
      const { queryByText, getByTestId } = await setup(inProgress, reviewer);

      const inProgressBanner = queryByText('IN PROGRESS');
      const checkbox = getByTestId('reviewingRegistrationCheckbox');

      expect(inProgressBanner).toBeTruthy();
      expect(checkbox).toBeTruthy();
    });

    it('should show the name of the person reviewing the registration and remove checkbox, when someone else is reviewing it', async () => {
      const inProgress = true;
      const reviewer = 'Another User';
      const { queryByText } = await setup(inProgress, reviewer);

      const inProgressBanner = queryByText('IN PROGRESS');
      const checkboxLabel = queryByText('I am reviewing this request');
      const expectedLabel = queryByText('Another User is reviewing this request');

      expect(inProgressBanner).toBeTruthy();
      expect(checkboxLabel).toBeFalsy();
      expect(expectedLabel).toBeTruthy();
    });

    it('should call updateRegistrationStatus when the checkbox is clicked', async () => {
      const { component, getByTestId, fixture } = await setup();
      const checkbox = getByTestId('reviewingRegistrationCheckbox');

      const parentRequestsService = TestBed.inject(ParentRequestsService);
      const updateApprovalSpy = spyOn(parentRequestsService, 'updateApprovalStatus').and.callThrough();

      fireEvent.click(checkbox);
      fixture.detectChanges();

      const updateData = {
        uid: component.registration.establishment.establishmentUid,
        status: 'In progress',
        reviewer: 'adminUser',
        inReview: true,
      };

      expect(updateApprovalSpy).toHaveBeenCalledWith(updateData);
    });

    it('should show a IN PROGRESS banner when the checkbox is clicked', async () => {
      const { getByTestId, queryByText, fixture } = await setup();
      const checkbox = getByTestId('reviewingRegistrationCheckbox');

      const parentRequestsService = TestBed.inject(ParentRequestsService);
      spyOn(parentRequestsService, 'updateApprovalStatus').and.returnValue(of({}));
      const getIndividualParentRequesteSpy = spyOn(parentRequestsService, 'getIndividualParentRequest').and.returnValue(
        of(InProgressApproval('adminUser') as any),
      );

      fireEvent.click(checkbox);
      fixture.detectChanges();

      const inProgressBanner = queryByText('IN PROGRESS');

      expect(inProgressBanner).toBeTruthy();
      expect(getIndividualParentRequesteSpy).toHaveBeenCalled();
    });

    it('should show an error when clicking on the checkbox and someone has already clicked on it while you have been on the page', async () => {
      const { getByTestId, getAllByText, fixture } = await setup();

      const mockErrorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {},
      });

      const parentRequestsService = TestBed.inject(ParentRequestsService);
      spyOn(parentRequestsService, 'updateApprovalStatus').and.returnValue(throwError(mockErrorResponse));

      const errorMessage = 'This approval is already in progress';
      const checkbox = getByTestId('reviewingRegistrationCheckbox');
      fireEvent.click(checkbox);
      fixture.detectChanges();

      expect(getAllByText(errorMessage).length).toBe(1);
    });

    it('should show an error when clicking on the checkbox and there is a problem with the server', async () => {
      const { getByTestId, getAllByText, fixture } = await setup();

      const mockErrorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: {},
      });

      const parentRequestsService = TestBed.inject(ParentRequestsService);
      spyOn(parentRequestsService, 'updateApprovalStatus').and.returnValue(throwError(mockErrorResponse));

      const errorMessage = 'There was a server error';
      const checkbox = getByTestId('reviewingRegistrationCheckbox');

      fireEvent.click(checkbox);
      fixture.detectChanges();

      expect(getAllByText(errorMessage).length).toBe(1);
    });

    it('should show the PENDING banner when unchecking the checkbox', async () => {
      const inProgress = true;
      const reviewer = 'adminUser';
      const { queryByText, getByTestId, fixture } = await setup(inProgress, reviewer);

      const checkbox = getByTestId('reviewingRegistrationCheckbox');

      const parentRequestsService = TestBed.inject(ParentRequestsService);
      spyOn(parentRequestsService, 'updateApprovalStatus').and.returnValue(of({}));
      const getIndividuaParentRequestSpy = spyOn(parentRequestsService, 'getIndividualParentRequest').and.returnValue(
        of(PendingApproval() as any),
      );

      fireEvent.click(checkbox);
      fixture.detectChanges();

      const pendingBanner = queryByText('PENDING');

      expect(pendingBanner).toBeTruthy();
      expect(getIndividuaParentRequestSpy).toHaveBeenCalled();
    });

    it('should show an error when clicking on the checkbox and there is an error retrieving the single registration', async () => {
      const { getByTestId, getAllByText, fixture } = await setup();

      const mockErrorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {},
      });

      const parentRequestsService = TestBed.inject(ParentRequestsService);
      spyOn(parentRequestsService, 'updateApprovalStatus').and.returnValue(of({}));
      spyOn(parentRequestsService, 'getIndividualParentRequest').and.returnValue(throwError(mockErrorResponse));

      const errorMessage = 'There was an error retrieving the approval';
      const checkbox = getByTestId('reviewingRegistrationCheckbox');
      fireEvent.click(checkbox);
      fixture.detectChanges();

      expect(getAllByText(errorMessage).length).toBe(1);
    });
  });
});
