import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Note } from '@core/model/registrations.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockRegistrationsService, RejectedRegistration } from '@core/test-utils/MockRegistrationsService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of, throwError } from 'rxjs';

import { RegistrationRequestsComponent } from '../registration-requests.component';
import { RejectedRegistrationRequestComponent } from './rejected-registration-request.component';

describe('RejectedRegistrationRequestComponent', () => {
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

  async function setup(existingNotes = false) {
    const { fixture, getByText, getAllByText, queryAllByText, queryByText, getByTestId, queryByTestId } = await render(
      RejectedRegistrationRequestComponent,
      {
        imports: [
          SharedModule,
          RouterModule,
          RouterTestingModule.withRoutes([
            { path: 'sfcadmin/registrations', component: RegistrationRequestsComponent },
          ]),
          HttpClientTestingModule,
          FormsModule,
          ReactiveFormsModule,
        ],
        providers: [
          { provide: BreadcrumbService, useClass: MockBreadcrumbService },
          { provide: RegistrationsService, useClass: MockRegistrationsService },
          { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
          { provide: SwitchWorkplaceService, useClass: MockSwitchWorkplaceService },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                data: {
                  registration: RejectedRegistration(),
                  loggedInUser: { fullname: 'adminUser', uid: '123' },
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

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a REJECTED banner at the top of the page', async () => {
    const { queryByText } = await setup();

    const rejectedBanner = queryByText('REJECTED');
    expect(rejectedBanner).toBeTruthy();
  });

  it('should display the workplace name twice (heading and name section)', async () => {
    const { queryAllByText, component } = await setup();

    const workplaceName = component.registration.establishment.name;
    expect(queryAllByText(workplaceName, { exact: false }).length).toBe(2);
  });

  it('should display the workplace id', async () => {
    const { getByText, component } = await setup();

    const workplaceId = component.registration.establishment.nmdsId;

    expect(getByText(workplaceId, { exact: false })).toBeTruthy();
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

    expect(getByText(locationId)).toBeTruthy();
    expect(getByText(provid)).toBeTruthy();
  });

  it('should display the main service', async () => {
    const { getByText, component } = await setup();

    const mainService = component.registration.establishment.mainService;

    expect(getByText(mainService, { exact: false })).toBeTruthy();
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
      const existingNotes = true;
      const { component, queryByTestId } = await setup(existingNotes);

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
        establishmentId: component.registration.establishment.id,
        noteType: 'Registration',
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

      const errorMessage = 'There was an error adding the note to the registration';

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

      const errorMessage = 'There was an error retrieving notes for this registration';

      const form = component.notesForm;
      form.controls['notes'].setValue('This is a note for this registration');
      form.controls['notes'].markAsDirty();
      const addNotesButton = getByText('Add this note');

      fireEvent.click(addNotesButton);
      fixture.detectChanges();

      expect(getAllByText(errorMessage).length).toBe(1);
    });
  });
});
