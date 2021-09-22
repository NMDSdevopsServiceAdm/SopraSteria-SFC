import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Registration } from '@core/model/registrations.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import {
  InProgressRegistration,
  mockRegistration,
  MockRegistrationsService,
  PendingRegistration,
} from '@core/test-utils/MockRegistrationsService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of, throwError } from 'rxjs';

import { RegistrationRequestComponent } from './registration-request.component';

describe('RegistrationRequestComponent', () => {
  const notes = [
    {
      createdAt: new Date('01/09/2021'),
      note: 'Note about the registration',
      user: { FullNameValue: 'adminUser' },
    },
    {
      createdAt: new Date('05/09/2021'),
      note: 'Another note about the registration',
      user: { FullNameValue: 'adminUser' },
    },
  ];

  async function setup(inProgress = false, reviewer = null, existingNotes = false) {
    const { fixture, getByText, getAllByText, queryAllByText, queryByText, getByTestId, queryByTestId } = await render(
      RegistrationRequestComponent,
      {
        imports: [
          SharedModule,
          RouterModule,
          RouterTestingModule,
          HttpClientTestingModule,
          FormsModule,
          ReactiveFormsModule,
        ],
        providers: [
          { provide: BreadcrumbService, useClass: MockBreadcrumbService },
          { provide: RegistrationsService, useClass: MockRegistrationsService },
          { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
          { provide: SwitchWorkplaceService, useClass: MockSwitchWorkplaceService },
          AlertService,
          WindowRef,
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                data: {
                  registration: inProgress ? InProgressRegistration(reviewer) : PendingRegistration(),
                  loggedInUser: { fullname: 'adminUser' },
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
      getByText,
      queryByText,
      queryAllByText,
      getByTestId,
      getAllByText,
      queryByTestId,
    };
  }

  it('should render a RegistrationRequestComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the workplace name twice (heading and name section)', async () => {
    const { queryAllByText, component } = await setup();

    const workplaceName = component.registration.establishment.name;
    expect(queryAllByText(workplaceName, { exact: false }).length).toBe(2);
  });

  it('should display the workplace address', async () => {
    const { getByText, component } = await setup();

    const address = component.registration.establishment.address;
    const address2 = component.registration.establishment.address2;
    const address3 = component.registration.establishment.address3;
    const postcode = component.registration.establishment.postcode;
    const town = component.registration.establishment.town;
    const county = component.registration.establishment.county;

    expect(getByText(address, { exact: false })).toBeTruthy();
    expect(getByText(address2, { exact: false })).toBeTruthy();
    expect(getByText(address3, { exact: false })).toBeTruthy();
    expect(getByText(postcode, { exact: false })).toBeTruthy();
    expect(getByText(town, { exact: false })).toBeTruthy();
    expect(getByText(county, { exact: false })).toBeTruthy();
  });

  it('should display the provider ID and location ID', async () => {
    const { getByText, component } = await setup();

    const locationId = component.registration.establishment.locationId;
    const provid = component.registration.establishment.provid;

    expect(getByText(locationId, { exact: false })).toBeTruthy();
    expect(getByText(provid, { exact: false })).toBeTruthy();
  });

  it('should display the date and time that the request was received', async () => {
    const { getByText } = await setup();

    const receivedDate = 'Received 1/1/2021 12:00am';

    expect(getByText(receivedDate, { exact: false })).toBeTruthy();
  });

  it('should display the main service', async () => {
    const { getByText, component } = await setup();

    const mainService = component.registration.establishment.mainService;

    expect(getByText(mainService, { exact: false })).toBeTruthy();
  });

  it('should display the user details when user registration', async () => {
    const { getByText, component } = await setup();

    const username = component.registration.username;
    const name = component.registration.name;
    const securityQuestion = component.registration.securityQuestion;
    const securityQuestionAnswer = component.registration.securityQuestionAnswer;
    const email = component.registration.email;
    const phone = component.registration.phone;

    expect(getByText(username, { exact: false })).toBeTruthy();
    expect(getByText(name, { exact: false })).toBeTruthy();
    expect(getByText(securityQuestion, { exact: false })).toBeTruthy();
    expect(getByText(securityQuestionAnswer, { exact: false })).toBeTruthy();
    expect(getByText(email, { exact: false })).toBeTruthy();
    expect(getByText(phone, { exact: false })).toBeTruthy();
  });

  it('should call navigateToWorkplace in switchWorkplaceService when the parentId link is clicked', async () => {
    const { fixture, getByText, component } = await setup();

    const switchWorkplaceService = TestBed.inject(SwitchWorkplaceService);

    const switchWorkplaceServiceSpy = spyOn(switchWorkplaceService, 'navigateToWorkplace');

    const parentId = component.registration.establishment.parentEstablishmentId;

    const parentIdLink = getByText(parentId, { exact: false });
    fireEvent.click(parentIdLink);

    fixture.detectChanges();

    expect(switchWorkplaceServiceSpy).toHaveBeenCalled();
  });

  describe('Updating workplace ID', () => {
    it('should have a success alert when delete is successful', async () => {
      const { component, fixture, getByText } = await setup();

      spyOn(component.registrationsService, 'updateWorkplaceId').and.returnValue(of({}));

      const alertService = TestBed.inject(AlertService);
      const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

      const form = component.workplaceIdForm;

      form.controls['nmdsId'].setValue('A1234567');
      form.controls['nmdsId'].markAsDirty();

      fireEvent.click(getByText('Save this ID'));
      fixture.detectChanges();

      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'The workplace ID has been successfully updated to A1234567',
      });
    });

    describe('Workplace ID validation', () => {
      it('displays enter a valid workplace ID message when box is empty', async () => {
        const { component, fixture, getByText } = await setup();

        const form = component.workplaceIdForm;
        const registrationsServiceSpy = spyOn(component.registrationsService, 'updateWorkplaceId');

        form.controls['nmdsId'].setValue('');
        form.controls['nmdsId'].markAsDirty();

        fireEvent.click(getByText('Save this ID'));

        fixture.detectChanges();

        expect(form.valid).toBeFalsy();
        expect(getByText('To update, enter a valid workplace ID', { exact: false })).toBeTruthy();
        expect(registrationsServiceSpy).not.toHaveBeenCalled();
      });

      it('shows length error message if workplace ID is shorter than 8 characters', async () => {
        const { component, fixture, getByText } = await setup();

        const form = component.workplaceIdForm;
        const registrationsServiceSpy = spyOn(component.registrationsService, 'updateWorkplaceId');

        form.controls['nmdsId'].setValue('A1');
        form.controls['nmdsId'].markAsDirty();

        fireEvent.click(getByText('Save this ID'));

        fixture.detectChanges();

        expect(form.valid).toBeFalsy();
        expect(getByText('Workplace ID must be 8 characters long', { exact: false })).toBeTruthy();
        expect(registrationsServiceSpy).not.toHaveBeenCalled();
      });

      it('shows length error message if workplace ID is longer than 8 characters', async () => {
        const { component, fixture, getByText } = await setup();

        const form = component.workplaceIdForm;
        const registrationsServiceSpy = spyOn(component.registrationsService, 'updateWorkplaceId');

        form.controls['nmdsId'].setValue('A123123123');
        form.controls['nmdsId'].markAsDirty();

        fireEvent.click(getByText('Save this ID'));

        fixture.detectChanges();

        expect(form.valid).toBeFalsy();
        expect(getByText('Workplace ID must be 8 characters long', { exact: false })).toBeTruthy();
        expect(registrationsServiceSpy).not.toHaveBeenCalled();
      });

      it('validates that a Workplace ID must start with an uppercase letter', async () => {
        const { component, fixture, getByText } = await setup();

        const form = component.workplaceIdForm;
        const registrationsServiceSpy = spyOn(component.registrationsService, 'updateWorkplaceId');

        form.controls['nmdsId'].setValue('a1231231');
        form.controls['nmdsId'].markAsDirty();

        fireEvent.click(getByText('Save this ID'));

        fixture.detectChanges();

        expect(form.valid).toBeFalsy();
        expect(getByText('Workplace ID must start with an uppercase letter', { exact: false })).toBeTruthy();
        expect(registrationsServiceSpy).not.toHaveBeenCalled();
      });
    });

    it('validates that a Workplace ID cannot be the same as an existing Workplace ID', async () => {
      const { component, fixture, getByText } = await setup();

      const form = component.workplaceIdForm;
      const mockErrorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {
          nmdsId: 'This workplace ID (A1231231) belongs to another workplace, enter a different workplace ID',
        },
      });

      spyOn(component.registrationsService, 'updateWorkplaceId').and.returnValue(throwError(mockErrorResponse));

      form.controls['nmdsId'].setValue('A1231231');
      form.controls['nmdsId'].markAsDirty();

      fireEvent.click(getByText('Save this ID'));

      fixture.detectChanges();

      expect(
        getByText(`This workplace ID (A1231231) belongs to another workplace, enter a different workplace ID`),
      ).toBeTruthy();
    });
  });

  describe('Checkbox component', () => {
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

    it('should show the name of the person reviewing the registration and remove checkbox, when already in progress', async () => {
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
      const { getByTestId, fixture } = await setup();
      const checkbox = getByTestId('reviewingRegistrationCheckbox');

      const registrationsService = TestBed.inject(RegistrationsService);
      const updateRegistrationSpy = spyOn(registrationsService, 'updateRegistrationStatus').and.callThrough();

      fireEvent.click(checkbox);
      fixture.detectChanges();

      const updateData = {
        uid: mockRegistration.establishment.uid,
        status: 'IN PROGRESS',
        reviewer: 'adminUser',
        inReview: true,
      };

      expect(updateRegistrationSpy).toHaveBeenCalledWith(updateData);
    });

    it('should show a IN PROGRESS banner when the checkbox is clicked', async () => {
      const { getByTestId, queryByText, fixture } = await setup();
      const checkbox = getByTestId('reviewingRegistrationCheckbox');

      const registrationsService = TestBed.inject(RegistrationsService);
      spyOn(registrationsService, 'updateRegistrationStatus').and.returnValue(of({}));
      const getSingleRegistrationSpy = spyOn(registrationsService, 'getSingleRegistration').and.returnValue(
        of(InProgressRegistration('adminUser') as Registration),
      );

      fireEvent.click(checkbox);
      fixture.detectChanges();

      const inProgressBanner = queryByText('IN PROGRESS');

      expect(inProgressBanner).toBeTruthy();
      expect(getSingleRegistrationSpy).toHaveBeenCalled();
    });

    it('should show an error when clicking on the checkbox and someone has already clicked on it while you have been on the page', async () => {
      const { getByTestId, getAllByText, fixture } = await setup();

      const registrationsService = TestBed.inject(RegistrationsService);
      spyOn(registrationsService, 'updateRegistrationStatus').and.returnValue(throwError('Error'));

      const errorMessage = 'This registration is already in progress';
      const checkbox = getByTestId('reviewingRegistrationCheckbox');
      fireEvent.click(checkbox);
      fixture.detectChanges();

      expect(getAllByText(errorMessage).length).toBe(1);
    });

    it('should show an error when an error is thrown by the updateRegistrationStatus call', async () => {
      const { getByTestId, getAllByText, fixture } = await setup();

      const mockErrorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {},
      });

      const registrationsService = TestBed.inject(RegistrationsService);
      spyOn(registrationsService, 'updateRegistrationStatus').and.returnValue(throwError(mockErrorResponse));

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

      const registrationsService = TestBed.inject(RegistrationsService);
      spyOn(registrationsService, 'updateRegistrationStatus').and.returnValue(of({}));
      const getSingleRegistrationSpy = spyOn(registrationsService, 'getSingleRegistration').and.returnValue(
        of(PendingRegistration() as Registration),
      );

      fireEvent.click(checkbox);
      fixture.detectChanges();

      const pendingBanner = queryByText('PENDING');

      expect(pendingBanner).toBeTruthy();
      expect(getSingleRegistrationSpy).toHaveBeenCalled();
    });

    it('should show an error when an error is thrown by the getSingleRegistration call', async () => {
      const { getByTestId, getAllByText, fixture } = await setup();

      const registrationsService = TestBed.inject(RegistrationsService);
      spyOn(registrationsService, 'updateRegistrationStatus').and.returnValue(of({}));
      spyOn(registrationsService, 'getSingleRegistration').and.returnValue(throwError('Error'));

      const errorMessage = 'There was an error retrieving the registration';
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

      const notes = component.registrationNotes;
      const notesList = queryByTestId('notesList');

      expect(notes).toBeFalsy();
      expect(notesList).toBeFalsy();
    });

    it('should show a list of notes when there are notes associated with this registration', async () => {
      const notInProgress = false;
      const noReviewer = null;
      const existingNotes = true;
      const { component, queryByTestId } = await setup(notInProgress, noReviewer, existingNotes);

      const notes = component.registrationNotes;
      const notesList = queryByTestId('notesList');

      expect(notes.length).toEqual(2);
      expect(notesList).toBeTruthy();
    });

    xit('should call the addRegistrationNote when the note is submitted', async () => {
      const { getByText, component, fixture, queryByTestId } = await setup();

      const registrationsService = TestBed.inject(RegistrationsService);
      const addRegistrationNotesSpy = spyOn(registrationsService, 'addRegistrationNote').and.callThrough();

      console.log(component);
      const textbox = fixture.debugElement.query(By.css('textarea')).nativeElement;
      textbox.value = 'This is a note';
      const addNotesButton = getByText('Add this note');

      fireEvent.click(addNotesButton);
      fixture.detectChanges();
      console.log(textbox);
      // console.log(form);

      expect(addRegistrationNotesSpy).toHaveBeenCalled();
    });

    xit('should submit a note and update the list of notes', async () => {});

    xit('should not be able to submit the note when textarea is empty', async () => {});

    xit('should show an error when an error is thrown', async () => {});
  });
});
