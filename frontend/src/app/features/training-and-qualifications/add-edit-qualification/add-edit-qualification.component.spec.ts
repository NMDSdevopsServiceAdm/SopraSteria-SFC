import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QualificationResponse, QualificationType } from '@core/model/qualification.model';
import { QualificationService } from '@core/services/qualification.service';
import { WorkerService } from '@core/services/worker.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { qualificationRecord } from '@core/test-utils/MockWorkerService';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { AddEditQualificationComponent } from './add-edit-qualification.component';

fdescribe('AddEditQualificationComponent', () => {
  async function setup(qualificationId = '1', qualificationInService = null) {
    const { fixture, getByText, getByTestId, queryByText, getByLabelText, getAllByText } = await render(
      AddEditQualificationComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: new MockActivatedRoute({
              snapshot: {
                params: { qualificationId: qualificationId },
              },
              parent: {
                snapshot: {
                  data: {
                    establishment: {
                      uid: '1',
                    },
                  },
                },
              },
            }),
          },
          { provide: WorkerService, useClass: MockWorkerServiceWithWorker },
          { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
          {
            provide: QualificationService,
            useValue: {
              selectedQualification: qualificationInService,
              clearSelectedQualification: () => {},
            },
          },
        ],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const workerService = injector.inject(WorkerService) as WorkerService;
    const qualificationService = injector.inject(QualificationService) as QualificationService;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByText,
      getByLabelText,
      routerSpy,
      getAllByText,
      workerService,
      qualificationService,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the workers name', async () => {
    const { component, getByText } = await setup();
    expect(getByText(component.worker.nameOrId, { exact: false })).toBeTruthy();
  });

  it('should navigate back to select qualification page if no qualification ID or selectedQualification in service', async () => {
    const { component, routerSpy } = await setup(null, null);

    component.ngOnInit();

    expect(routerSpy).toHaveBeenCalledWith([
      `/workplace/${component.workplace.uid}/training-and-qualifications-record/${component.worker.uid}/add-qualification`,
    ]);
  });

  describe('title', () => {
    it('should render the Add qualification details title', async () => {
      const { component, fixture, getByText } = await setup();

      component.qualificationId = null;
      fixture.detectChanges();

      expect(getByText('Add qualification record details')).toBeTruthy();
    });

    it('should render the Qualification details title when there is a qualification id and record', async () => {
      const { component, fixture, getByText } = await setup();

      component.record = qualificationRecord;
      fixture.detectChanges();

      expect(getByText('Qualification record details')).toBeTruthy();
    });
  });

  describe('delete link', () => {
    it('should render the delete link when editing qualification', async () => {
      const { component, fixture, getByText } = await setup();

      component.record = qualificationRecord;
      fixture.detectChanges();

      expect(getByText('Delete this qualification record')).toBeTruthy();
    });

    it('should not render the delete link when there is no qualification id', async () => {
      const { queryByText } = await setup(null);

      expect(queryByText('Delete this qualification record')).toBeFalsy();
    });

    it('should navigate to delete confirmation page', async () => {
      const { component, routerSpy, getByTestId } = await setup();
      const deleteQualificationRecord = getByTestId('delete-this-qualification-record');

      fireEvent.click(deleteQualificationRecord);
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'training-and-qualifications-record',
        component.worker.uid,
        'qualification',
        component.qualificationId,
        'delete',
      ]);
    });
  });

  describe('notes', async () => {
    it('should have the notes section closed on page load', async () => {
      const { getByText, getByTestId } = await setup();

      const notesSection = getByTestId('notesSection');

      expect(getByText('Open notes')).toBeTruthy();
      expect(notesSection.getAttribute('class')).toContain('govuk-visually-hidden');
    });

    it('should display the notes section after clicking Open notes', async () => {
      const { fixture, getByText, getByTestId } = await setup();
      const openNotesButton = getByText('Open notes');
      openNotesButton.click();

      fixture.detectChanges();

      const notesSection = getByTestId('notesSection');

      expect(getByText('Close notes')).toBeTruthy();
      expect(notesSection.getAttribute('class')).not.toContain('govuk-visually-hidden');
    });

    it('should show number of characters label', async () => {
      const { fixture, getByText } = await setup(null);
      const openNotesButton = getByText('Open notes');
      openNotesButton.click();

      fixture.detectChanges();

      expect(getByText('You have 500 characters remaining')).toBeTruthy();
    });

    it('should show a count of how many characters there are remaining until the limit of the notes input', async () => {
      const { fixture, getByLabelText, getByText } = await setup(null);
      const openNotesButton = getByText('Open notes');
      openNotesButton.click();

      fixture.detectChanges();

      const notesTextBox = getByLabelText('Add a note');
      userEvent.type(notesTextBox, 'aaaaa');
      fixture.detectChanges();
      expect(getByText('You have 495 characters remaining')).toBeTruthy();
    });

    it('should show by how many characters the user has exceeded the limit of the notes input', async () => {
      const { fixture, getByLabelText, getByText } = await setup(null);
      const openNotesButton = getByText('Open notes');
      openNotesButton.click();

      fixture.detectChanges();

      const notesTextBox = getByLabelText('Add a note');

      userEvent.type(
        notesTextBox,
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      );
      fixture.detectChanges();
      expect(getByText('You have 4 characters too many')).toBeTruthy();
    });

    it('should show singular message when the user has exceeded the limit of the notes input by 1', async () => {
      const { fixture, getByLabelText, getByText } = await setup(null);

      const openNotesButton = getByText('Open notes');
      openNotesButton.click();

      fixture.detectChanges();

      const notesTextBox = getByLabelText('Add a note');

      userEvent.type(
        notesTextBox,
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      );
      fixture.detectChanges();
      expect(getByText('You have 1 character too many')).toBeTruthy();
    });
  });

  fdescribe('qualification certificates', () => {
    const mockQualification = { group: QualificationType.NVQ, id: 10, title: 'Worker safety qualification' };
    const mockUploadFile1 = new File(['file content'], 'worker safety 2023.pdf', { type: 'application/pdf' });
    const mockUploadFile2 = new File(['file content'], 'worker safety 2024.pdf', { type: 'application/pdf' });

    describe('certificates to be uploaded', () => {
      it('should add a new upload file to the certification table when a file is selected', async () => {
        const { component, fixture, getByTestId } = await setup(null, mockQualification);
        const uploadSection = getByTestId('uploadCertificate');
        const fileInput = within(uploadSection).getByTestId('fileInput');

        expect(fileInput).toBeTruthy();

        userEvent.upload(getByTestId('fileInput'), mockUploadFile1);
        fixture.detectChanges();

        const certificationTable = getByTestId('qualificationCertificatesTable');

        expect(certificationTable).toBeTruthy();
        expect(within(certificationTable).getByText(mockUploadFile1.name)).toBeTruthy();
        expect(component.filesToUpload).toEqual([mockUploadFile1]);
      });

      it('should remove an upload file when its remove button is clicked', async () => {
        const { component, fixture, getByTestId, getByText } = await setup();
        fixture.autoDetectChanges();

        userEvent.upload(getByTestId('fileInput'), mockUploadFile1);
        userEvent.upload(getByTestId('fileInput'), mockUploadFile2);

        const certificationTable = getByTestId('qualificationCertificatesTable');
        expect(within(certificationTable).getByText(mockUploadFile1.name)).toBeTruthy();
        expect(within(certificationTable).getByText(mockUploadFile2.name)).toBeTruthy();

        const rowForFile1 = getByText(mockUploadFile1.name).parentElement;
        const removeButtonForFile1 = within(rowForFile1).getByText('Remove');

        userEvent.click(removeButtonForFile1);

        expect(within(certificationTable).queryByText(mockUploadFile1.name)).toBeFalsy();

        expect(within(certificationTable).queryByText(mockUploadFile2.name)).toBeTruthy();
        expect(component.filesToUpload).toHaveSize(1);
        expect(component.filesToUpload[0]).toEqual(mockUploadFile2);
      });
    });

    describe('saved certificates', () => {
      const savedCertificates = [
        {
          uid: 'uid-1',
          filename: 'worker_safety_v1.pdf',
          uploadDate: '2024-04-12T14:44:29.151Z',
        },
        {
          uid: 'uid-2',
          filename: 'worker_safety_v2.pdf',
          uploadDate: '2024-04-12T14:44:29.151Z',
        },
        {
          uid: 'uid-3',
          filename: 'worker_safety_v3.pdf',
          uploadDate: '2024-04-12T14:44:29.151Z',
        },
      ];

      it('should display a row for each certificate', async () => {
        const { component, fixture, getByTestId } = await setup();
        component.qualificationCertificates = savedCertificates;

        fixture.detectChanges();

        savedCertificates.forEach((certificate, index) => {
          const certificateRow = getByTestId(`certificate-row-${index}`);
          expect(certificateRow).toBeTruthy();
          expect(within(certificateRow).getByText(certificate.filename)).toBeTruthy();
          expect(within(certificateRow).getByText('Download')).toBeTruthy();
          expect(within(certificateRow).getByText('Remove')).toBeTruthy();
        });
      });

      it('should remove a file from the table when the remove button is clicked', async () => {
        const { component, fixture, getByTestId, queryByText } = await setup();

        component.qualificationCertificates = savedCertificates;

        fixture.detectChanges();

        const certificateRow2 = getByTestId('certificate-row-2');
        const removeButtonForRow2 = within(certificateRow2).getByText('Remove');

        fireEvent.click(removeButtonForRow2);
        fixture.detectChanges();

        expect(component.qualificationCertificates.length).toBe(2);
        expect(queryByText(savedCertificates[2].filename)).toBeFalsy();
      });
    });
  });

  describe('setting data from qualification service', () => {
    const mockQualification = { group: QualificationType.NVQ, id: 10, title: 'Worker safety qualification' };

    it('should display qualification type and name when retrieved from service', async () => {
      const { getByText } = await setup(null, mockQualification);

      expect(getByText(mockQualification.title)).toBeTruthy();
    });

    [
      { qualificationType: QualificationType.NVQ, expectedConversion: 'NVQ' },
      { qualificationType: QualificationType.Other, expectedConversion: 'other type of qualification' },
      { qualificationType: QualificationType.Certificate, expectedConversion: 'certificate' },
      { qualificationType: QualificationType.Degree, expectedConversion: 'degree' },
      { qualificationType: QualificationType.Award, expectedConversion: 'award' },
      { qualificationType: QualificationType.Diploma, expectedConversion: 'diploma' },
      { qualificationType: QualificationType.Apprenticeship, expectedConversion: 'apprenticeship' },
    ].forEach(({ qualificationType, expectedConversion }) => {
      it(`should convert the qualification group to be lowercase unless it's an acronym: '${qualificationType}' to '${expectedConversion}'`, async () => {
        const mockQualificationWithType = { group: qualificationType, id: 10, title: 'Worker safety qualification' };

        const { getByText } = await setup(null, mockQualificationWithType);

        expect(getByText('Type: ' + expectedConversion)).toBeTruthy();
      });
    });

    it('should display change link', async () => {
      const { getByText } = await setup(null, mockQualification);

      const changeLink = getByText('Change');

      expect(changeLink).toBeTruthy();
    });

    it('should make call to createQualification with details from selectedQualification and updated fields when submitting for new qual', async () => {
      const notes = 'Here are some test notes';

      const { component, fixture, getByText, workerService, getByLabelText } = await setup(null, mockQualification);

      const createQualificationSpy = spyOn(workerService, 'createQualification').and.returnValue(of(null));

      const yearInput = fixture.nativeElement.querySelector('#year');
      userEvent.type(yearInput, '2019');

      const openNotesButton = getByText('Open notes');
      openNotesButton.click();
      fixture.detectChanges();

      userEvent.type(getByLabelText('Add a note'), notes);

      fireEvent.click(getByText('Save record'));

      expect(createQualificationSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        type: mockQualification.group,
        qualification: { id: mockQualification.id },
        year: 2019,
        notes: notes,
      });
    });

    it('should should clear selectedQualification in service on submission', async () => {
      const { getByText, workerService, qualificationService } = await setup(null, mockQualification);

      spyOn(workerService, 'createQualification').and.returnValue(of(null));
      const clearSelectedQualificationSpy = spyOn(qualificationService, 'clearSelectedQualification');

      fireEvent.click(getByText('Save record'));

      expect(clearSelectedQualificationSpy).toHaveBeenCalled();
    });

    it('should should clear selectedQualification in service on click of Cancel', async () => {
      const { getByText, qualificationService } = await setup(null, mockQualification);

      const clearSelectedQualificationSpy = spyOn(qualificationService, 'clearSelectedQualification');

      fireEvent.click(getByText('Cancel'));

      expect(clearSelectedQualificationSpy).toHaveBeenCalled();
    });
  });

  describe('prefilling data for existing qualification', () => {
    const mockQualificationData = {
      created: '2024-10-01T08:53:35.143Z',
      notes: 'ihoihio',
      qualification: {
        group: 'Degree',
        id: 136,
        level: '6',
        title: 'Health and social care degree (level 6)',
      },

      uid: 'fd50276b-e27c-48a6-9015-f0c489302666',
      updated: '2024-10-01T08:53:35.143Z',
      updatedBy: 'duncan',
      year: 1999,
    } as QualificationResponse;

    const setupWithExistingQualification = async () => {
      const { component, workerService, fixture, getByText, queryByText, getByTestId } = await setup(
        'mockQualificationId',
      );

      spyOn(workerService, 'getQualification').and.returnValue(of(mockQualificationData));
      const updateQualificationSpy = spyOn(workerService, 'updateQualification').and.returnValue(of(null));

      component.ngOnInit();
      fixture.detectChanges();

      return { component, workerService, fixture, getByText, queryByText, updateQualificationSpy, getByTestId };
    };

    it('should display qualification title and lower case group', async () => {
      const { getByText } = await setupWithExistingQualification();

      expect(getByText('Type: degree')).toBeTruthy();
      expect(getByText(mockQualificationData.qualification.title)).toBeTruthy();
    });

    it('should not have Change link when it is an existing qualification record', async () => {
      const { queryByText } = await setupWithExistingQualification();

      expect(queryByText('Change')).toBeFalsy();
    });

    it('should prefill notes box, have reveal open and update character count when existing notes', async () => {
      const { fixture, getByText, getByTestId } = await setupWithExistingQualification();

      const notesSection = getByTestId('notesSection');
      const notesBox = fixture.nativeElement.querySelector('#notes');

      expect(getByText('Close notes')).toBeTruthy();
      expect(notesSection.getAttribute('class')).not.toContain('govuk-visually-hidden');
      expect(notesBox.value).toEqual(mockQualificationData.notes);
      expect(getByText('You have 493 characters remaining')).toBeTruthy();
    });

    it('should prefill year input box with year from existing qualification', async () => {
      const { fixture } = await setupWithExistingQualification();

      const yearInput = fixture.nativeElement.querySelector('#year');

      expect(yearInput.value).toEqual(mockQualificationData.year.toString());
    });

    it('should make call to updateQualification with existing record details and updated fields when submitting for existing qual', async () => {
      const { component, fixture, getByText, updateQualificationSpy } = await setupWithExistingQualification();

      const yearInput = fixture.nativeElement.querySelector('#year');
      userEvent.clear(yearInput);
      userEvent.type(yearInput, '2023');

      const saveButton = getByText('Save and return');
      userEvent.click(saveButton);

      expect(updateQualificationSpy).toHaveBeenCalledWith(
        component.workplace.uid,
        component.worker.uid,
        component.qualificationId,
        {
          type: mockQualificationData.qualification.group,
          qualification: { id: mockQualificationData.qualification.id },
          year: 2023,
          notes: mockQualificationData.notes,
        },
      );
    });
  });

  describe('error messages', async () => {
    it('should show error message if year achieved is more than 100 years ago', async () => {
      const { getByLabelText, getByText, getAllByText } = await setup(null);

      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 101);
      const yearAchievedInput = getByLabelText('Year achieved');

      userEvent.type(yearAchievedInput, `${pastDate.getFullYear()}`);
      fireEvent.click(getByText('Save record'));

      expect(getAllByText('Year achieved must be this year or no more than 100 years ago').length).toEqual(2);
    });

    it('should show error message if year achieved is in the future', async () => {
      const { getByLabelText, getByText, getAllByText } = await setup(null);

      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const yearAchievedInput = getByLabelText('Year achieved');

      userEvent.type(yearAchievedInput, `${futureDate.getFullYear()}`);
      fireEvent.click(getByText('Save record'));

      expect(getAllByText('Year achieved must be this year or no more than 100 years ago').length).toEqual(2);
    });

    it('should show error messages if too many characters are entered into the notes input', async () => {
      const { fixture, getByLabelText, getByText, getAllByText } = await setup(null);

      const openNotesButton = getByText('Open notes');
      openNotesButton.click();
      fixture.detectChanges();

      userEvent.type(
        getByLabelText('Add a note'),
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      );
      fireEvent.click(getByText('Save record'));
      expect(getAllByText('Notes must be 500 characters or fewer').length).toEqual(2);
    });

    it('should open the notes section if notes input error and section is closed on submit', async () => {
      const { fixture, getByText, getByLabelText, getByTestId } = await setup(null);

      const openNotesButton = getByText('Open notes');
      openNotesButton.click();
      fixture.detectChanges();

      userEvent.type(
        getByLabelText('Add a note'),
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      );

      const closeNotesButton = getByText('Close notes');
      closeNotesButton.click();
      fixture.detectChanges();

      fireEvent.click(getByText('Save record'));
      fixture.detectChanges();

      const notesSection = getByTestId('notesSection');

      expect(getByText('Close notes')).toBeTruthy();
      expect(notesSection.getAttribute('class')).not.toContain('govuk-visually-hidden');
    });

    fdescribe('uploadCertificate errors', () => {
      it('should show an error message if the selected file is over 500 KB', async () => {
        const { fixture, getByTestId, getByText } = await setup(null);

        const mockUploadFile = new File(['some file content'], 'large-file.pdf', { type: 'application/pdf' });
        Object.defineProperty(mockUploadFile, 'size', {
          value: 10 * 1024 * 1024, // 10MB
        });

        const fileInputButton = getByTestId('fileInput');

        userEvent.upload(fileInputButton, mockUploadFile);

        fixture.detectChanges();

        expect(getByText('The certificate must be no larger than 500KB')).toBeTruthy();
      });

      it('should show an error message if the selected file is not a pdf file', async () => {
        const { fixture, getByTestId, getByText } = await setup(null);

        const mockUploadFile = new File(['some file content'], 'non-pdf.png', { type: 'image/png' });

        const fileInputButton = getByTestId('fileInput');

        userEvent.upload(fileInputButton, [mockUploadFile]);

        fixture.detectChanges();

        expect(getByText('The certificate must be a PDF file')).toBeTruthy();
      });

      it('should clear the error message when user select a valid file instead', async () => {
        const { fixture, getByTestId, getByText, queryByText } = await setup(null);
        fixture.autoDetectChanges();

        const invalidFile = new File(['some file content'], 'non-pdf.png', { type: 'image/png' });
        const validFile = new File(['some file content'], 'certificate.pdf', { type: 'application/pdf' });

        const fileInputButton = getByTestId('fileInput');
        userEvent.upload(fileInputButton, [invalidFile]);
        expect(getByText('The certificate must be a PDF file')).toBeTruthy();

        userEvent.upload(fileInputButton, [validFile]);
        expect(queryByText('The certificate must be a PDF file')).toBeFalsy();
      });

      it('should provide aria description to screen reader users when error happen', async () => {
        const { fixture, getByTestId } = await setup(null);
        fixture.autoDetectChanges();

        const uploadSection = getByTestId('uploadCertificate');
        const fileInput = getByTestId('fileInput');

        userEvent.upload(fileInput, new File(['some file content'], 'non-pdf-file.csv'));

        const uploadButton = within(uploadSection).getByRole('button', {
          description: /Error: The certificate must be a PDF file/,
        });
        expect(uploadButton).toBeTruthy();
      });
    });
  });
});
