import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { WindowRef } from '@core/services/window.ref';
import { InProgressApproval, PendingApproval } from '@core/test-utils/MockCqcStatusChangeService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockRegistrationsService } from '@core/test-utils/MockRegistrationsService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { throwError } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';

import { ParentRequestIndividualComponent } from './parent-request-individual.component';

fdescribe('ParentRequestIndividualComponent', () => {
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

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const alertService = TestBed.inject(AlertService);
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      component,
      fixture,
      routerSpy,
      alertServiceSpy,
      queryAllByText,
      getByText,
      queryByText,
      getByTestId,
      getAllByText,
      queryByTestId,
    };
  }

  it('should render a CqcIndividualMainServiceChangeComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Approvals', () => {
    it('shows dialog with approval confirmation message when Approve button is clicked', async () => {
      const { fixture, getByText } = await setup();

      const approveButton = getByText('Approve');
      const dialogMessage = `You're about to approve this parent request`;

      fireEvent.click(approveButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');

      expect(dialog).toBeTruthy();
      expect(within(dialog).getByText(dialogMessage, { exact: false })).toBeTruthy();
    });

    it('shows workplace name in confirmation dialog', async () => {
      const { component, fixture, getByText } = await setup();

      const approveButton = getByText('Approve');
      const workplaceName = component.registration.establishment.name;

      fireEvent.click(approveButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');

      expect(within(dialog).getByText(workplaceName, { exact: false })).toBeTruthy();
    });

    it('should return to parent request page once approved', async () => {
      const { fixture, getByText, routerSpy } = await setup();

      const parentRequestsService = TestBed.inject(ParentRequestsService);
      spyOn(parentRequestsService, 'parentApproval').and.returnValue(of(true));
      const approveButton = getByText('Approve');

      fireEvent.click(approveButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');
      const approvalConfirmButton = within(dialog).getByText('Approve this request');

      fireEvent.click(approvalConfirmButton);

      expect(routerSpy).toHaveBeenCalledWith(['/sfcadmin', 'parent-requests']);
    });

    it('should call parentApproval in the parent requests service when approval confirmed', async () => {
      const { component, fixture, getByText } = await setup();

      const parentRequestsService = TestBed.inject(ParentRequestsService);
      spyOn(parentRequestsService, 'parentApproval').and.returnValue(of(true));
      const approveButton = getByText('Approve');

      fireEvent.click(approveButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');
      const approvalConfirmButton = within(dialog).getByText('Approve this request');

      fireEvent.click(approvalConfirmButton);

      expect(parentRequestsService.parentApproval).toHaveBeenCalledWith({
        approvalId: component.registration.requestId,
        establishmentId: component.registration.establishment.establishmentId,
        userId: component.registration.userId,
        rejectionReason: 'Approved',
        approve: true,
      });
    });

    it('should display approval server error message when server error', async () => {
      const { fixture, getByText } = await setup();

      const parentRequestsService = TestBed.inject(ParentRequestsService);
      spyOn(parentRequestsService, 'parentApproval').and.returnValue(throwError('Service unavailable'));

      const approveButton = getByText('Approve');
      fireEvent.click(approveButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');
      const approvalConfirmButton = within(dialog).getByText('Approve this request');
      fireEvent.click(approvalConfirmButton);

      const approvalServerErrorMessage = 'There was an error completing the approval';
      expect(getByText(approvalServerErrorMessage, { exact: false })).toBeTruthy();
    });

    it('should show approval alert when approval confirmed', async () => {
      const { component, fixture, getByText, alertServiceSpy } = await setup();

      const parentRequestsService = TestBed.inject(ParentRequestsService);
      spyOn(parentRequestsService, 'parentApproval').and.returnValue(of(true));

      const approveButton = getByText('Approve');
      const workplaceName = component.registration.establishment.name;

      fireEvent.click(approveButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');
      const approvalConfirmButton = within(dialog).getByText('Approve this request');
      fireEvent.click(approvalConfirmButton);

      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: `The parent request of workplace ${workplaceName} has been approved`,
      });
    });
  });
  // describe('Rejections', () => {
  //   it('shows dialog with reject confirmation message when Reject button is clicked', async () => {
  //     const { fixture, getByText } = await setup();

  //     const approveButton = getByText('Reject');
  //     const dialogMessage = `You're about to reject this parent request`;

  //     fireEvent.click(approveButton);
  //     fixture.detectChanges();

  //     const dialog = await within(document.body).findByRole('dialog');

  //     expect(dialog).toBeTruthy();
  //     expect(within(dialog).getByText(dialogMessage, { exact: false })).toBeTruthy();
  //   });
  // });
});
