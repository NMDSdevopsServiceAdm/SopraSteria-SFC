import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CqcStatusChange } from '@core/model/cqc-status-change.model';
import { Note } from '@core/model/registrations.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { InProgressApproval, PendingApproval } from '@core/test-utils/MockCqcStatusChangeService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockRegistrationsService } from '@core/test-utils/MockRegistrationsService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of, throwError } from 'rxjs';

import { CQCMainServiceChangeListComponent } from '../cqc-main-service-change-list.component';
import { CqcIndividualMainServiceChangeComponent } from './cqc-individual-main-service-change.component';

describe('CqcIndividualMainServiceChangeComponent', () => {
  const notes = [
    {
      createdAt: new Date('01/09/2021'),
      note: 'Note about the cqc status change',
      user: { FullNameValue: 'adminUser' },
    },
    {
      createdAt: new Date('05/09/2021'),
      note: 'Another note about the cqc status change',
      user: { FullNameValue: 'adminUser' },
    },
  ];

  async function setup(inProgress = false, reviewer = null, existingNotes = false) {
    const { fixture, getByText, queryByText, getByTestId, queryByTestId, getAllByText, queryAllByText } = await render(
      CqcIndividualMainServiceChangeComponent,
      {
        imports: [
          SharedModule,
          RouterModule,
          RouterTestingModule.withRoutes([
            { path: 'sfcadmin/cqc-main-service-change', component: CQCMainServiceChangeListComponent },
          ]),
          HttpClientTestingModule,
          FormsModule,
          ReactiveFormsModule,
        ],
        providers: [
          AlertService,
          WindowRef,
          { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
          { provide: BreadcrumbService, useClass: MockBreadcrumbService },
          { provide: SwitchWorkplaceService, useClasee: MockSwitchWorkplaceService },
          { provide: RegistrationsService, useClass: MockRegistrationsService },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                data: {
                  loggedInUser: { fullname: 'adminUser', uid: '123' },
                  approval: inProgress ? InProgressApproval(reviewer) : PendingApproval(),
                  notes: existingNotes && notes,
                },
              },
            },
          },
        ],
      },
    );

    const component = fixture.componentInstance;
    const alertService = TestBed.inject(AlertService);
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      component,
      fixture,
      queryAllByText,
      getByText,
      queryByText,
      getByTestId,
      getAllByText,
      queryByTestId,
      alertServiceSpy,
    };
  }

  it('should render a CqcIndividualMainServiceChangeComponent', async () => {
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

  it('should display the current and requested services', async () => {
    const { getByText, component } = await setup();
    const requestedService = component.registration.data.requestedService.name;
    const currentService = component.registration.data.currentService.name;

    expect(getByText(requestedService, { exact: false })).toBeTruthy();
    expect(getByText(currentService, { exact: false })).toBeTruthy();
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

      const cqcStatusChangeService = TestBed.inject(CqcStatusChangeService);
      const updateApprovalSpy = spyOn(cqcStatusChangeService, 'updateApprovalStatus').and.callThrough();

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

      const cqcStatusChangeService = TestBed.inject(CqcStatusChangeService);
      spyOn(cqcStatusChangeService, 'updateApprovalStatus').and.returnValue(of({}));
      const getIndividualCqcStatusChangeSpy = spyOn(
        cqcStatusChangeService,
        'getIndividualCqcStatusChange',
      ).and.returnValue(of(InProgressApproval('adminUser') as CqcStatusChange));

      fireEvent.click(checkbox);
      fixture.detectChanges();

      const inProgressBanner = queryByText('IN PROGRESS');

      expect(inProgressBanner).toBeTruthy();
      expect(getIndividualCqcStatusChangeSpy).toHaveBeenCalled();
    });

    it('should show an error when clicking on the checkbox and someone has already clicked on it while you have been on the page', async () => {
      const { getByTestId, getAllByText, fixture } = await setup();

      const mockErrorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {},
      });

      const cqcStatusChangeService = TestBed.inject(CqcStatusChangeService);
      spyOn(cqcStatusChangeService, 'updateApprovalStatus').and.returnValue(throwError(mockErrorResponse));

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

      const cqcStatusChangeService = TestBed.inject(CqcStatusChangeService);
      spyOn(cqcStatusChangeService, 'updateApprovalStatus').and.returnValue(throwError(mockErrorResponse));

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

      const cqcStatusChangeService = TestBed.inject(CqcStatusChangeService);
      spyOn(cqcStatusChangeService, 'updateApprovalStatus').and.returnValue(of({}));
      const getIndividualCqcStatusChangeSpy = spyOn(
        cqcStatusChangeService,
        'getIndividualCqcStatusChange',
      ).and.returnValue(of(PendingApproval() as CqcStatusChange));

      fireEvent.click(checkbox);
      fixture.detectChanges();

      const pendingBanner = queryByText('PENDING');

      expect(pendingBanner).toBeTruthy();
      expect(getIndividualCqcStatusChangeSpy).toHaveBeenCalled();
    });

    it('should show an error when clicking on the checkbox and there is an error retrieving the single registration', async () => {
      const { getByTestId, getAllByText, fixture } = await setup();

      const mockErrorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {},
      });

      const cqcStatusChangeService = TestBed.inject(CqcStatusChangeService);
      spyOn(cqcStatusChangeService, 'updateApprovalStatus').and.returnValue(of({}));
      spyOn(cqcStatusChangeService, 'getIndividualCqcStatusChange').and.returnValue(throwError(mockErrorResponse));

      const errorMessage = 'There was an error retrieving the approval';
      const checkbox = getByTestId('reviewingRegistrationCheckbox');
      fireEvent.click(checkbox);
      fixture.detectChanges();

      expect(getAllByText(errorMessage).length).toBe(1);
    });
  });

  describe('Notes component', () => {
    it('should show a textbox', async () => {
      const { getByTestId, queryByText } = await setup();

      const textbox = getByTestId('notesTextbox');
      const addNotesButton = queryByText('Add this note');

      expect(textbox).toBeTruthy();
      expect(addNotesButton).toBeTruthy();
    });

    it('should not show any notes when there are not notes for this registration', async () => {
      const { queryByTestId, component } = await setup();

      const notes = component.notes;
      const notesList = queryByTestId('notesList');

      expect(notes).toBeFalsy();
      expect(notesList).toBeFalsy();
    });

    it('should show a list of notes when there are notes associated with this registration', async () => {
      const notInProgress = false;
      const noReviewer = null;
      const existingNotes = true;
      const { component, queryByTestId } = await setup(notInProgress, noReviewer, existingNotes);

      const notes = component.notes;
      const notesList = queryByTestId('notesList');

      expect(notes.length).toEqual(2);
      expect(notesList).toBeTruthy();
    });

    it('should call addRegistrationNote when the note is submitted', async () => {
      const { getByText, component, fixture } = await setup();

      const registrationsService = TestBed.inject(RegistrationsService);
      const addRegistrationNotesSpy = spyOn(registrationsService, 'addRegistrationNote').and.callThrough();

      const form = component.notesForm;
      form.controls['notes'].setValue('This is a note for this registration');
      form.controls['notes'].markAsDirty();
      const addNotesButton = getByText('Add this note');

      fireEvent.click(addNotesButton);
      fixture.detectChanges();

      const expectedBody = {
        note: 'This is a note for this registration',
        establishmentId: component.registration.establishment.establishmentId,
        noteType: 'Main Service',
        userUid: '123',
      };

      expect(addRegistrationNotesSpy).toHaveBeenCalledWith(expectedBody);
    });

    it('should submit a note and update the list of notes', async () => {
      const { component, getByText, fixture, queryByTestId } = await setup();
      const addedNote = [
        {
          createdAt: new Date('01/09/2021'),
          note: 'This is a note for this registration',
          user: { FullNameValue: 'adminUser' },
        },
      ];
      const registrationsService = TestBed.inject(RegistrationsService);
      spyOn(registrationsService, 'addRegistrationNote').and.returnValue(of({}));
      const getRegistrationNotesSpy = spyOn(registrationsService, 'getRegistrationNotes').and.returnValue(
        of(addedNote as Note[]),
      );

      const form = component.notesForm;
      form.controls['notes'].setValue('This is a note for this registration');
      form.controls['notes'].markAsDirty();
      const addNotesButton = getByText('Add this note');

      fireEvent.click(addNotesButton);
      fixture.detectChanges();

      const notesList = queryByTestId('notesList');

      expect(notesList).toBeTruthy();
      expect(getRegistrationNotesSpy).toHaveBeenCalled();
    });

    it('should not be able to submit the note when textarea is empty', async () => {
      const { getByText } = await setup();

      const registrationsService = TestBed.inject(RegistrationsService);
      const addRegistrationNoteSpy = spyOn(registrationsService, 'addRegistrationNote');

      const addNotesButton = getByText('Add this note');
      fireEvent.click(addNotesButton);

      expect(addRegistrationNoteSpy).not.toHaveBeenCalled();
    });

    it('should show an error message when an error is thrown adding registration note', async () => {
      const { getByText, getAllByText, component, fixture } = await setup();

      const mockErrorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {},
      });

      const registrationsService = TestBed.inject(RegistrationsService);
      spyOn(registrationsService, 'addRegistrationNote').and.returnValue(throwError(mockErrorResponse));

      const errorMessage = 'There was an error adding the note';

      const form = component.notesForm;
      form.controls['notes'].setValue('This is a note for this registration');
      form.controls['notes'].markAsDirty();
      const addNotesButton = getByText('Add this note');

      fireEvent.click(addNotesButton);
      fixture.detectChanges();

      expect(getAllByText(errorMessage).length).toBe(1);
    });

    it('should show an error message when there is a problem with the service', async () => {
      const { getByText, getAllByText, component, fixture } = await setup();

      const mockErrorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: {},
      });

      const registrationsService = TestBed.inject(RegistrationsService);
      spyOn(registrationsService, 'addRegistrationNote').and.returnValue(throwError(mockErrorResponse));

      const errorMessage = 'There was a server error';

      const form = component.notesForm;
      form.controls['notes'].setValue('This is a note for this registration');
      form.controls['notes'].markAsDirty();
      const addNotesButton = getByText('Add this note');

      fireEvent.click(addNotesButton);
      fixture.detectChanges();

      expect(getAllByText(errorMessage).length).toBe(1);
    });

    it('should show an error message when there is a problem retrieving notes', async () => {
      const { getByText, getAllByText, component, fixture } = await setup();

      const mockErrorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: {},
      });

      const registrationsService = TestBed.inject(RegistrationsService);
      spyOn(registrationsService, 'addRegistrationNote').and.returnValue(of({}));
      spyOn(registrationsService, 'getRegistrationNotes').and.returnValue(throwError(mockErrorResponse));

      const errorMessage = 'There was an error retrieving the notes';

      const form = component.notesForm;
      form.controls['notes'].setValue('This is a note for this registration');
      form.controls['notes'].markAsDirty();
      const addNotesButton = getByText('Add this note');

      fireEvent.click(addNotesButton);
      fixture.detectChanges();

      expect(getAllByText(errorMessage).length).toBe(1);
    });
  });

  describe('Approvals', () => {
    it('shows dialog with approval confirmation message when Approve button is clicked', async () => {
      const { fixture, getByText } = await setup();

      const approveButton = getByText('Approve');
      const dialogMessage = `You're about to approve this CQC main service change`;

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

    it('should call registrationApproval in registrations service when approval confirmed', async () => {
      const { component, fixture, getByText } = await setup();

      const cqcStatusChangeService = TestBed.inject(CqcStatusChangeService);
      spyOn(cqcStatusChangeService, 'updateApprovalStatus').and.returnValue(of(true));
      const approveButton = getByText('Approve');

      fireEvent.click(approveButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');
      const approvalConfirmButton = within(dialog).getByText('Approve this change');

      fireEvent.click(approvalConfirmButton);

      expect(cqcStatusChangeService.updateApprovalStatus).toHaveBeenCalledWith({
        uid: component.registration.establishment.establishmentUid,
        status: 'Approved',
        reviewer: null,
        inReview: false,
      });
    });

    it('should display approval server error message when server error', async () => {
      const { fixture, getByText } = await setup();

      const approvalServerErrorMessage = 'There was an error completing the approval';

      const cqcStatusChangeService = TestBed.inject(CqcStatusChangeService);
      spyOn(cqcStatusChangeService, 'updateApprovalStatus').and.returnValue(throwError('Service unavailable'));
      const approveButton = getByText('Approve');

      fireEvent.click(approveButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');
      const approvalConfirmButton = within(dialog).getByText('Approve this change');

      fireEvent.click(approvalConfirmButton);

      expect(getByText(approvalServerErrorMessage, { exact: false })).toBeTruthy();
    });

    it('should show approval alert when approval confirmed', async () => {
      const { component, fixture, getByText, alertServiceSpy } = await setup();

      const cqcStatusChangeService = TestBed.inject(CqcStatusChangeService);
      spyOn(cqcStatusChangeService, 'updateApprovalStatus').and.returnValue(of(true));

      const approveButton = getByText('Approve');
      const workplaceName = component.registration.establishment.name;

      fireEvent.click(approveButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');
      const approvalConfirmButton = within(dialog).getByText('Approve this change');

      fireEvent.click(approvalConfirmButton);

      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: `The main service change of workplace ${workplaceName} has been approved`,
      });
    });
  });

  describe('Rejections', () => {
    it('shows dialog with rejection confirmation message when Reject button is clicked', async () => {
      const { fixture, getByText } = await setup();

      const rejectButton = getByText('Reject');
      const dialogMessage = `You're about to reject this CQC main service change`;

      fireEvent.click(rejectButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');

      expect(dialog).toBeTruthy();
      expect(within(dialog).getByText(dialogMessage, { exact: false })).toBeTruthy();
    });

    it('shows workplace name in rejection confirmation dialog', async () => {
      const { component, fixture, getByText } = await setup();

      const rejectButton = getByText('Reject');
      const workplaceName = component.registration.establishment.name;

      fireEvent.click(rejectButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');

      expect(within(dialog).getByText(workplaceName, { exact: false })).toBeTruthy();
    });

    it('should call registrationApproval in registrations service when rejection confirmed', async () => {
      const { component, fixture, getByText } = await setup();

      const cqcStatusChangeService = TestBed.inject(CqcStatusChangeService);
      spyOn(cqcStatusChangeService, 'updateApprovalStatus').and.returnValue(of(true));
      const rejectButton = getByText('Reject');

      fireEvent.click(rejectButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');
      const rejectConfirmButton = within(dialog).getByText('Reject this change');

      fireEvent.click(rejectConfirmButton);

      expect(cqcStatusChangeService.updateApprovalStatus).toHaveBeenCalledWith({
        uid: component.registration.establishment.establishmentUid,
        status: 'Rejected',
        reviewer: null,
        inReview: false,
      });
    });

    it('should display rejection server error message when server error', async () => {
      const { fixture, getByText } = await setup();

      const rejectionServerErrorMessage = 'There was an error completing the rejection';

      const cqcStatusChangeService = TestBed.inject(CqcStatusChangeService);
      spyOn(cqcStatusChangeService, 'updateApprovalStatus').and.returnValue(throwError('Service unavailable'));
      const rejectButton = getByText('Reject');

      fireEvent.click(rejectButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');
      const rejectionConfirmButton = within(dialog).getByText('Reject this change');

      fireEvent.click(rejectionConfirmButton);

      expect(getByText(rejectionServerErrorMessage, { exact: false })).toBeTruthy();
    });

    it('should show rejection alert when rejection confirmed', async () => {
      const { component, fixture, getByText, alertServiceSpy } = await setup();

      const cqcStatusChangeService = TestBed.inject(CqcStatusChangeService);
      spyOn(cqcStatusChangeService, 'updateApprovalStatus').and.returnValue(of(true));

      const workplaceName = component.registration.establishment.name;
      const rejectButton = getByText('Reject');

      fireEvent.click(rejectButton);
      fixture.detectChanges();

      const dialog = await within(document.body).findByRole('dialog');
      const rejectionConfirmButton = within(dialog).getByText('Reject this change');

      fireEvent.click(rejectionConfirmButton);

      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: `The main service change of workplace ${workplaceName} has been rejected`,
      });
    });
  });

  describe('Navigation', () => {
    it('has cqc main service change page url for exit link', async () => {
      const { getByText } = await setup();
      const exitButton = getByText('Exit');

      expect(exitButton.getAttribute('href')).toBe('/sfcadmin/cqc-main-service-change');
    });
  });
});
