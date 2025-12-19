import lodash from 'lodash';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { TrainingCertificateDownloadEvent, TrainingCertificateUploadEvent } from '@core/model/training.model';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { NewTrainingComponent } from './new-training.component';
import { provideRouter, RouterModule } from '@angular/router';

describe('NewTrainingComponent', async () => {
  const trainingCategories = [
    {
      category: 'Autism',
      id: 2,
      trainingRecords: [
        {
          accredited: true,
          completed: new Date('10/23/2021'),
          expires: new Date('10/23/2022'),
          title: 'Autism training',
          trainingCategory: { id: 2, category: 'Autism' },
          trainingCertificates: [],
          uid: 'someAutismUid',
          trainingStatus: 1,
          created: new Date('10/23/2021'),
          updatedBy: 'admin',
          updated: new Date('10/23/2021'),
        },
        {
          accredited: true,
          completed: new Date('10/20/2021'),
          expires: new Date('10/20/2022'),
          title: 'Autism training 2',
          trainingCategory: { id: 2, category: 'Autism' },
          trainingCertificates: [],
          uid: 'someAutismUid2',
          trainingStatus: 2,
          created: new Date('10/20/2021'),
          updatedBy: 'admin',
          updated: new Date('10/20/2021'),
        },
      ],
    },
    {
      category: 'Communication',
      id: 3,
      trainingRecords: [
        {
          accredited: true,
          completed: new Date('09/20/2020'),
          expires: new Date('09/20/2021'),
          title: 'Communication training',
          trainingCategory: { id: 3, category: 'Communication' },
          trainingCertificates: [],
          uid: 'someCommunicationUid',
          trainingStatus: 3,
          created: new Date('09/20/2020'),
          updatedBy: 'admin',
          updated: new Date('09/20/2020'),
        },
      ],
    },
    {
      category: 'Health',
      id: 1,
      trainingRecords: [
        {
          accredited: false,
          completed: new Date('10/20/2021'),
          expires: new Date('10/20/2022'),
          title: 'Health training',
          trainingCategory: { id: 1, category: 'Health' },
          trainingCertificates: [],
          uid: 'someHealthUid',
          trainingStatus: 0,
          created: new Date('10/20/2021'),
          updatedBy: 'admin',
          updated: new Date('10/20/2021'),
        },
        {
          accredited: false,
          completed: new Date('10/20/2021'),
          expires: new Date('10/20/2022'),
          title: '',
          trainingCategory: { id: 1, category: 'Health' },
          trainingCertificates: [],
          uid: 'someHealthUid2',
          trainingStatus: 0,
          created: new Date('10/20/2021'),
          updatedBy: 'admin',
          updated: new Date('10/20/2021'),
        },
      ],
    },
  ];

  async function setup(override: any = {}) {
    const mockTrainingCategories = override?.trainingCategories ?? trainingCategories;
    const { fixture, getByTestId, getByLabelText } = await render(NewTrainingComponent, {
      imports: [HttpClientTestingModule, SharedModule, RouterModule],
      providers: [provideRouter([])],
      componentProperties: {
        canEditWorker: true,
        trainingCategories: mockTrainingCategories,
        isMandatoryTraining: false,
        certificateErrors: null,
        ...override,
      },
    });
    const component = fixture.componentInstance;

    return {
      component,
      getByTestId,
      getByLabelText,
      fixture,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('training record table contents', async () => {
    it('should render a category heading name for each training record category', async () => {
      const { fixture } = await setup();

      const autismCategory = fixture.debugElement.query(By.css('[data-testid="category-Autism"]')).nativeElement;
      const communicationCategory = fixture.debugElement.query(
        By.css('[data-testid="category-Communication"]'),
      ).nativeElement;
      const healthCategory = fixture.debugElement.query(By.css('[data-testid="category-Health"]')).nativeElement;

      expect(autismCategory.textContent).toContain('Autism');
      expect(communicationCategory.textContent).toContain('Communication');
      expect(healthCategory.textContent).toContain('Health');
    });

    it('should render missing training name when there is no title for a training record', async () => {
      const { fixture } = await setup();

      const healthTrainingTitle = fixture.debugElement.query(
        By.css('[data-testid="Title-someHealthUid"]'),
      ).nativeElement;
      const healthTraining2Title = fixture.debugElement.query(
        By.css('[data-testid="Title-someHealthUid2"]'),
      ).nativeElement;

      expect(healthTrainingTitle.textContent).toContain('Health training');
      expect(healthTraining2Title.textContent).toContain('Missing training name (Add)');
    });
  });

  describe('training record links', async () => {
    it('training title should have link to training records if you are an edit user', async () => {
      const { fixture } = await setup();

      const autismTrainingTitleLink = fixture.debugElement.query(
        By.css('[data-testid="Title-someAutismUid"]'),
      ).nativeElement;
      const communicationTrainingTitleLink = fixture.debugElement.query(
        By.css('[data-testid="Title-someCommunicationUid"]'),
      ).nativeElement;
      const healthTrainingTitleLink = fixture.debugElement.query(
        By.css('[data-testid="Title-someHealthUid"]'),
      ).nativeElement;
      const healthTraining2TitleLink = fixture.debugElement.query(
        By.css('[data-testid="Title-someHealthUid2"]'),
      ).nativeElement;

      expect(
        autismTrainingTitleLink
          .getAttribute('href')
          .slice(0, autismTrainingTitleLink.getAttribute('href').indexOf(';')),
      ).toBe('/training/someAutismUid');
      expect(
        communicationTrainingTitleLink
          .getAttribute('href')
          .slice(0, communicationTrainingTitleLink.getAttribute('href').indexOf(';')),
      ).toBe('/training/someCommunicationUid');
      expect(
        healthTrainingTitleLink
          .getAttribute('href')
          .slice(0, healthTrainingTitleLink.getAttribute('href').indexOf(';')),
      ).toBe('/training/someHealthUid');
      expect(
        healthTraining2TitleLink
          .getAttribute('href')
          .slice(0, healthTraining2TitleLink.getAttribute('href').indexOf(';')),
      ).toBe('/training/someHealthUid2');
    });

    it('training title should not link to training records if you are a read only user', async () => {
      const { fixture } = await setup({ canEditWorker: false });

      const autismTrainingTitleLink = fixture.debugElement.query(By.css('[data-testid="Title-no-link-someAutismUid"]'));
      const communicationTrainingTitleLink = fixture.debugElement.query(
        By.css('[data-testid="Title-no-link-someCommunicationUid"]'),
      );
      const healthTrainingTitleLink = fixture.debugElement.query(By.css('[data-testid="Title-no-link-someHealthUid"]'));
      const healthTraining2TitleLink = fixture.debugElement.query(
        By.css('[data-testid="Title-no-link-someHealthUid2"]'),
      );

      expect(autismTrainingTitleLink).toBeTruthy();
      expect(autismTrainingTitleLink).toBeTruthy();
      expect(communicationTrainingTitleLink).toBeTruthy();
      expect(healthTrainingTitleLink).toBeTruthy();
      expect(healthTraining2TitleLink).toBeTruthy();
    });

    it('should link to "matching-layout" page instead if the training record is linked to a training course', async () => {
      const mockTrainingCategories = lodash.cloneDeep(trainingCategories);
      mockTrainingCategories[0].trainingRecords[0]['isMatchedToTrainingCourse'] = true;

      const { getByTestId } = await setup({ trainingCategories: mockTrainingCategories });
      const autismTrainingTitleLink = getByTestId('Title-someAutismUid');
      expect(autismTrainingTitleLink.getAttribute('href')).toEqual('/training/someAutismUid/matching-layout');
    });
  });

  describe('no training', async () => {
    it('should display a no training found link when there is no training and isMandatoryTraining is false and canEditWorker is true', async () => {
      const { fixture } = await setup({ trainingCategories: [] });

      const noTrainingLink = fixture.debugElement.query(By.css('[data-testid="no-training-link"]')).nativeElement;

      expect(noTrainingLink).toBeTruthy();
      expect(noTrainingLink.getAttribute('href')).toBe('/add-training');
    });

    it('should not display a no training found link when there is no training and isMandatoryTraining is false and canEditWorker is false', async () => {
      const { fixture } = await setup({ trainingCategories: [], canEditWorker: false });

      const noTrainingLink = fixture.debugElement.query(By.css('[data-testid="no-training-link"]'));

      expect(noTrainingLink).toBeFalsy();
    });

    it('should display a no mandatory training found link when there is no mandatory training and isMandatoryTraining is true and canEditWorker is true', async () => {
      const { component, fixture } = await setup({ trainingCategories: [], isMandatoryTraining: true });

      component.workplaceUid = '123';
      component.ngOnChanges();
      fixture.detectChanges();
      const noMandatoryTrainingLink = fixture.debugElement.query(
        By.css('[data-testid="no-mandatory-training-link"]'),
      ).nativeElement;
      expect(noMandatoryTrainingLink).toBeTruthy();
      expect(noMandatoryTrainingLink.getAttribute('href')).toBe('/workplace/123/add-and-manage-mandatory-training');
    });

    it('should not display a no mandatory training found link when there is no mandatory training and isMandatoryTraining is true and canEditWorker is false', async () => {
      const { component, fixture } = await setup();

      component.trainingCategories = [];
      component.isMandatoryTraining = true;
      component.workplaceUid = '123';
      component.canEditWorker = false;
      component.ngOnChanges();
      fixture.detectChanges();
      const noMandatoryTrainingLink = fixture.debugElement.query(By.css('[data-testid="no-mandatory-training-link"]'));

      expect(noMandatoryTrainingLink).toBeFalsy();
    });

    it('should display a no mandatory training for job role message when mandatory training is not required for the job role', async () => {
      const { component, fixture } = await setup({
        trainingCategories: [],
        isMandatoryTraining: true,
        missingMandatoryTraining: false,
      });

      component.workplaceUid = '123';
      fixture.detectChanges();

      const mandatoryTrainingMissingLink = fixture.debugElement.query(
        By.css('[data-testid="no-mandatory-training-link"]'),
      );
      const messageText = 'No mandatory training has been added for this job role yet.';
      const mandatoryTrainingMessage = fixture.debugElement.query(
        (debugElement) => debugElement.nativeElement.textContent === messageText,
      );

      expect(mandatoryTrainingMessage).toBeTruthy();
      expect(mandatoryTrainingMissingLink).toBeTruthy();
    });

    it('should display a no mandatory training for job role message when mandatory training is missing', async () => {
      const { component, fixture } = await setup({
        trainingCategories: [],
        isMandatoryTraining: true,
        missingMandatoryTraining: true,
      });

      component.workplaceUid = '123';
      fixture.detectChanges();

      const mandatoryTrainingMissingLink = fixture.debugElement.query(
        By.css('[data-testid="mandatory-training-missing-link"]'),
      );
      const messageText = 'No mandatory training records have been added for this person yet.';
      const mandatoryTrainingMessage = fixture.debugElement.query(
        (debugElement) => debugElement.nativeElement.textContent === messageText,
      );

      expect(mandatoryTrainingMessage).toBeTruthy();
      expect(mandatoryTrainingMissingLink).toBeTruthy();
    });
  });

  describe('expired flag', () => {
    it('should not show if there is no expiry date', async () => {
      const { component, fixture } = await setup();

      component.trainingCategories[0].trainingRecords[0].expires = null;
      fixture.detectChanges();

      const expiredAutismTrainingExpired = fixture.debugElement.query(
        By.css('[data-testid="status-expired-someAutismUid"]'),
      );
      const expiredAutismTrainingExpiring = fixture.debugElement.query(
        By.css('[data-testid="status-expiring-someAutismUid"]'),
      );

      expect(expiredAutismTrainingExpired).toBeFalsy();
      expect(expiredAutismTrainingExpiring).toBeFalsy();
    });

    it('should not show if expiry date has not passed', async () => {
      const { component, fixture } = await setup();

      const today = new Date();
      const yearFromNow = today.setFullYear(today.getFullYear() + 1);

      component.trainingCategories[0].trainingRecords[0].expires = new Date(yearFromNow);
      component.trainingCategories[0].trainingRecords[0].trainingStatus = 0;
      fixture.detectChanges();

      const expiredAutismTrainingExpired = fixture.debugElement.query(
        By.css('[data-testid="status-expired-someAutismUid"]'),
      );
      const expiredAutismTrainingExpiring = fixture.debugElement.query(
        By.css('[data-testid="status-expiring-someAutismUid"]'),
      );

      expect(expiredAutismTrainingExpired).toBeFalsy();
      expect(expiredAutismTrainingExpiring).toBeFalsy();
    });

    it('should show expired if expiry date has passed', async () => {
      const { component, fixture } = await setup();

      const today = new Date();
      const yearBeforeNow = today.setFullYear(today.getFullYear() - 1);

      component.trainingCategories[0].trainingRecords[0].expires = new Date(yearBeforeNow);
      component.trainingCategories[0].trainingRecords[0].trainingStatus = 3;
      fixture.detectChanges();

      const expiredAutismTrainingExpired = fixture.debugElement.query(
        By.css('[data-testid="status-expired-someAutismUid"]'),
      );
      const expiredAutismTrainingExpiring = fixture.debugElement.query(
        By.css('[data-testid="status-expiring-someAutismUid"]'),
      );

      expect(expiredAutismTrainingExpired).toBeTruthy();
      expect(expiredAutismTrainingExpiring).toBeFalsy();
    });

    it('should show expires soon', async () => {
      const { component, fixture } = await setup();

      const today = new Date();
      const monthFromNow = today.setMonth(today.getMonth() + 1);

      component.trainingCategories[0].trainingRecords[0].expires = new Date(monthFromNow);
      component.trainingCategories[0].trainingRecords[0].trainingStatus = 1;
      fixture.detectChanges();

      const expiredAutismTrainingExpired = fixture.debugElement.query(
        By.css('[data-testid="status-expired-someAutismUid"]'),
      );
      const expiredAutismTrainingExpiring = fixture.debugElement.query(
        By.css('[data-testid="status-expiring-someAutismUid"]'),
      );

      expect(expiredAutismTrainingExpired).toBeFalsy();
      expect(expiredAutismTrainingExpiring).toBeTruthy();
    });
  });

  describe('Training certificates', () => {
    const singleTrainingCertificate = () => [
      {
        filename: 'test.pdf',
        uid: '1872ec19-510d-41de-995d-6abfd3ae888a',
        uploadDate: '2024-09-20T08:57:45.000Z',
      },
    ];

    const multipleTrainingCertificates = () => [
      {
        filename: 'test.pdf',
        uid: '1872ec19-510d-41de-995d-6abfd3ae888a',
        uploadDate: '2024-09-20T08:57:45.000Z',
      },
      {
        filename: 'test2.pdf',
        uid: '1872ec19-510d-41de-995d-6abfd3ae888b',
        uploadDate: '2024-09-19T08:57:45.000Z',
      },
    ];

    it('should display Download link when training record has one certificate associated with it', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.trainingCategories[0].trainingRecords[0].trainingCertificates = singleTrainingCertificate();
      fixture.detectChanges();

      const trainingRecordWithCertificateRow = getByTestId('someAutismUid');
      expect(within(trainingRecordWithCertificateRow).getByText('Download')).toBeTruthy();
    });

    it('should not display Download link when training record has one certificate associated with it but user does not have edit permissions', async () => {
      const { component, fixture, getByTestId } = await setup({ canEditWorker: false });

      component.trainingCategories[0].trainingRecords[0].trainingCertificates = singleTrainingCertificate();
      fixture.detectChanges();

      const trainingRecordWithCertificateRow = getByTestId('someAutismUid');
      expect(within(trainingRecordWithCertificateRow).queryByText('Download')).toBeFalsy();
    });

    it('should trigger download file emitter when Download link is clicked', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.trainingCategories[0].trainingRecords[0].trainingCertificates = singleTrainingCertificate();
      fixture.detectChanges();

      const downloadFileSpy = spyOn(component.downloadFile, 'emit');

      const downloadLink = within(getByTestId('someAutismUid')).getByText('Download');

      userEvent.click(downloadLink);
      const expectedTrainingRecord = component.trainingCategories[0].trainingRecords[0];
      const expectedDownloadEvent: TrainingCertificateDownloadEvent = {
        recordType: 'training',
        recordUid: expectedTrainingRecord.uid,
        categoryName: expectedTrainingRecord.trainingCategory.category,
        filesToDownload: expectedTrainingRecord.trainingCertificates,
      };

      expect(downloadFileSpy).toHaveBeenCalledOnceWith(expectedDownloadEvent);
    });

    it('should display Select a download link when training record has more than one certificate associated with it', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.trainingCategories[0].trainingRecords[0].trainingCertificates = multipleTrainingCertificates();
      fixture.detectChanges();

      const trainingRecordWithCertificateRow = getByTestId('someAutismUid');
      expect(within(trainingRecordWithCertificateRow).getByText('Select a download')).toBeTruthy();
    });

    it('should not display Select a download link when training record has more than one certificate associated with it but user does not have edit permissions', async () => {
      const { component, fixture, getByTestId } = await setup({ canEditWorker: false });

      component.trainingCategories[0].trainingRecords[0].trainingCertificates = multipleTrainingCertificates();
      fixture.detectChanges();

      const trainingRecordWithCertificateRow = getByTestId('someAutismUid');
      expect(within(trainingRecordWithCertificateRow).queryByText('Select a download')).toBeFalsy();
    });

    it('should have href of training record on Select a download link', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.trainingCategories[0].trainingRecords[0].trainingCertificates = multipleTrainingCertificates();
      fixture.detectChanges();

      const trainingRecordUid = component.trainingCategories[0].trainingRecords[0].uid;

      const trainingRecordWithCertificateRow = getByTestId(trainingRecordUid);
      const selectADownloadLink = within(trainingRecordWithCertificateRow).getByText('Select a download');

      expect(selectADownloadLink.getAttribute('href')).toEqual(`/training/${trainingRecordUid}`);
    });

    it('should display Upload file button when training record has no certificates associated with it', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.trainingCategories[0].trainingRecords[0].trainingCertificates = [];
      fixture.detectChanges();

      const trainingRecordWithCertificateRow = getByTestId('someAutismUid');
      expect(within(trainingRecordWithCertificateRow).getByText('Upload file')).toBeTruthy();
    });

    it('should not display Upload file button when training record has no certificates associated with it but user does not have edit permissions', async () => {
      const { component, fixture, getByTestId } = await setup({ canEditWorker: false });

      component.trainingCategories[0].trainingRecords[0].trainingCertificates = [];
      fixture.detectChanges();

      const trainingRecordWithCertificateRow = getByTestId('someAutismUid');
      expect(within(trainingRecordWithCertificateRow).queryByText('Upload file')).toBeFalsy();
    });

    it('should trigger the upload file emitter when a file is selected by the Upload file button', async () => {
      const { component, fixture, getByTestId } = await setup();
      const mockUploadFile = new File(['some file content'], 'certificate.pdf');
      const uploadFileSpy = spyOn(component.uploadFile, 'emit');

      component.trainingCategories[0].trainingRecords[0].trainingCertificates = [];
      fixture.detectChanges();

      const trainingRecordWithCertificateRow = getByTestId('someAutismUid');
      const fileInput = within(trainingRecordWithCertificateRow).getByTestId('fileInput');

      userEvent.upload(fileInput, [mockUploadFile]);

      const expectedTrainingRecord = component.trainingCategories[0].trainingRecords[0];
      const expectedUploadEvent: TrainingCertificateUploadEvent = {
        recordType: 'training',
        recordUid: expectedTrainingRecord.uid,
        categoryName: expectedTrainingRecord.trainingCategory.category,
        files: [mockUploadFile],
      };

      expect(uploadFileSpy).toHaveBeenCalledWith(expectedUploadEvent);
    });

    it('should display an error message above the category when download certificate fails', async () => {
      const certificateErrors = {
        Autism: "There's a problem with this download. Try again later or contact us for help.",
      };
      const { getByTestId } = await setup({ certificateErrors });

      const categorySection = getByTestId('Autism-section');
      expect(
        within(categorySection).getByText(
          "There's a problem with this download. Try again later or contact us for help.",
        ),
      ).toBeTruthy();
    });

    describe('PDF rendering', () => {
      it('should show the text "Uploaded" at certificate column if one or more certificates were uploaded', async () => {
        const { component, fixture, getByTestId } = await setup({ pdfRenderingMode: true });

        component.trainingCategories[0].trainingRecords[0].trainingCertificates = multipleTrainingCertificates();
        fixture.detectChanges();

        const trainingRecordWithCertificateRow = getByTestId('someAutismUid');
        expect(within(trainingRecordWithCertificateRow).getByText('Uploaded')).toBeTruthy();
      });

      it('should show the text "Not uploaded" at certificate column if no certificates were uploaded', async () => {
        const { component, fixture, getByTestId } = await setup({ pdfRenderingMode: true });

        component.trainingCategories[0].trainingRecords[0].trainingCertificates = [];
        fixture.detectChanges();

        const trainingRecordWithCertificateRow = getByTestId('someAutismUid');
        expect(within(trainingRecordWithCertificateRow).getByText('Not uploaded')).toBeTruthy();
      });
    });
  });
});
