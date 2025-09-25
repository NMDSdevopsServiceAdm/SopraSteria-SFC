import { fireEvent, render, within } from '@testing-library/angular';
import { DoYouWantToDowloadTrainAndQualsComponent } from './do-you-want-to-download-train-and-quals.component';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerService, qualificationsByGroup, workerBuilder } from '@core/test-utils/MockWorkerService';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkersModule } from '../workers.module';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { Establishment } from '@core/model/establishment.model';
import { getTestBed } from '@angular/core/testing';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { MockPreviousRouteService } from '@core/test-utils/MockPreviousRouteService';
import {
  DownloadCertificateService,
  QualificationCertificateService,
  TrainingCertificateService,
} from '@core/services/certificate.service';
import { FileUtil } from '@core/utils/file-util';
import {
  mockCertificateFileBlob,
  MockQualificationCertificateService,
  mockTrainingCertificates,
  MockTrainingCertificateService,
} from '@core/test-utils/MockCertificateService';
import { mockQualificationCertificates } from '../../../core/test-utils/MockCertificateService';
import { PdfMakeService } from '@core/services/pdf-make.service';
import { TrainingRecords } from '@core/model/training.model';

describe('DoYouWantToDowloadTrainAndQualsComponent', () => {
  const yesRadio = 'Yes, I want to download the summary and any certificates';
  const noRadio = 'No, I do not want to download the summary and any certificates';

  const mockWorker = workerBuilder();
  const activeDate = new Date();
  activeDate.setDate(activeDate.getDate() + 93); // 3 months in the future
  const mockTrainingData: TrainingRecords = {
    lastUpdated: new Date('2020-01-01'),
    mandatory: [],
    jobRoleMandatoryTrainingCount: [],
    nonMandatory: [
      {
        category: 'Health',
        id: 1,
        trainingRecords: [
          {
            accredited: true,
            completed: new Date('10/20/2021'),
            expires: activeDate,
            title: 'Health training',
            trainingCategory: { id: 1, category: 'Health' },
            trainingCertificates: [],
            trainingStatus: 0,
            uid: 'someHealthuid',
            created: new Date('10/20/2021'),
            updated: new Date('10/20/2021'),
            updatedBy: '',
          },
        ],
      },
    ],
  };

  const qualifications = {
    groups: [
      {
        group: 'IT',
        records: [
          { title: 'CompTI', year: '2020', qualificationCertificates: ['a.pdf'] },
          { title: 'Cisco CCNA', year: '', qualificationCertificates: [] },
        ],
      },
    ],
  };

  async function setup(overrides: any = {}) {
    const workplace = establishmentBuilder() as Establishment;

    const setupTools = await render(DoYouWantToDowloadTrainAndQualsComponent, {
      imports: [RouterModule, HttpClientTestingModule, WorkersModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        AlertService,
        WindowRef,
        ErrorSummaryService,
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: PreviousRouteService,
          useFactory: MockPreviousRouteService.factory(overrides.previousUrl),
          deps: [Router],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  establishment: workplace,
                },
                url: [{ path: 'download-staff-training-and-qualifications' }],
              },
            },
            snapshot: {
              data: {
                establishment: workplace,
                worker: mockWorker,
                trainingAndQualificationRecords: {
                  training: mockTrainingData,
                  qualifications: qualifications,
                },
              },
            },
          },
        },
        { provide: TrainingCertificateService, useClass: MockTrainingCertificateService },
        { provide: QualificationCertificateService, useClass: MockQualificationCertificateService },
        { provide: PdfMakeService, useValue: { generateTrainingAndQualifications: () => {} } },
        DownloadCertificateService,
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const alertService = injector.inject(AlertService) as AlertService;
    const alertServiceSpy = spyOn(alertService, 'addAlert');

    const workerService = injector.inject(WorkerService) as WorkerService;

    const trainingCertificateService = injector.inject(TrainingCertificateService) as TrainingCertificateService;
    const qualificationCertificateService = injector.inject(
      QualificationCertificateService,
    ) as QualificationCertificateService;

    const PdfMakeServiceInject = injector.inject(PdfMakeService) as PdfMakeService;

    return {
      component,
      ...setupTools,
      routerSpy,
      alertServiceSpy,
      workerService,
      trainingCertificateService,
      qualificationCertificateService,
      PdfMakeServiceInject,
    };
  }

  it('should render a DoYouWantToDowloadTrainAndQualsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the worker name and page heading', async () => {
    const { component, getByText, getByTestId } = await setup();

    const sectionHeading = getByTestId('section-heading');
    const headingText = getByText(
      'Do you want to download their training and qualifications summary, and any certificates, before you delete this staff record?',
    );

    expect(within(sectionHeading).getByText(component.worker.nameOrId)).toBeTruthy();
    expect(headingText).toBeTruthy();
  });

  it('should render the radio buttons', async () => {
    const { component, getByLabelText } = await setup();

    expect(getByLabelText(yesRadio)).toBeTruthy();
    expect(getByLabelText(noRadio)).toBeTruthy();
  });

  it('should render the continue button ', async () => {
    const { component, getByText } = await setup();

    expect(getByText('Continue')).toBeTruthy();
  });

  it('should render the cancel link with the correct url to go back to staff-record-summary', async () => {
    const { component, fixture, getByText } = await setup();

    const cancelLink = getByText('Cancel');

    fireEvent.click(cancelLink);
    fixture.detectChanges();

    expect(getByText('Cancel')).toBeTruthy();
    expect(cancelLink.getAttribute('href')).toEqual(
      `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary`,
    );
  });

  it('should prefill if they came from the previous page', async () => {
    const previousUrl = `/workplace/workplace-uid/staff-record/staff-uid/delete-staff-record`;
    const { component, fixture, getByText, getByLabelText } = await setup({ previousUrl });

    const continueButton = getByText('Continue');
    fireEvent.click(getByText(yesRadio));
    fireEvent.click(continueButton);
    fixture.detectChanges();

    component.ngOnInit();

    const form = component.form;

    const radioButton = getByLabelText(yesRadio) as HTMLInputElement;

    expect(form.value.downloadTrainAndQuals).toEqual('Yes');
    expect(radioButton.checked).toBeTruthy();
    expect(form.valid).toBeTruthy();
  });

  describe('submit', () => {
    it('navigates to delete-staff-record and calls the alertService', async () => {
      const {
        component,
        fixture,
        getByText,
        routerSpy,
        alertServiceSpy,
        workerService,
        trainingCertificateService,
        qualificationCertificateService,
        PdfMakeServiceInject,
      } = await setup();

      const continueButton = getByText('Continue');
      const workerServiceSpy = spyOn(workerService, 'setDoYouWantToDownloadTrainAndQualsAnswer');
      const componentSpy = spyOn(component, 'downloadAllCertificates').and.returnValue(Promise.resolve(true));
      spyOn(component, 'downloadTrainingAndQualsPdfWhenDeleteStaff').and.resolveTo(undefined);

      spyOn(trainingCertificateService, 'downloadAllCertificatesAsBlobs').and.callThrough();
      spyOn(qualificationCertificateService, 'downloadAllCertificatesAsBlobs').and.callThrough();

      spyOn(FileUtil, 'saveFilesAsZip').and.callThrough();

      fireEvent.click(getByText(yesRadio));
      fireEvent.click(continueButton);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(workerServiceSpy).toHaveBeenCalledWith('Yes');
      await componentSpy.calls.mostRecent().returnValue;
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'delete-staff-record',
      ]);

      await routerSpy.calls.mostRecent().returnValue;
      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: "The training and qualifications summary has downloaded to your computer's Downloads folder",
      });
    });

    it('navigates to delete-staff-record and does not call the alertService', async () => {
      const { component, fixture, getByText, routerSpy, alertServiceSpy, workerService } = await setup();

      const continueButton = getByText('Continue');
      const workerServiceSpy = spyOn(workerService, 'setDoYouWantToDownloadTrainAndQualsAnswer');

      fireEvent.click(getByText(noRadio));
      fireEvent.click(continueButton);
      fixture.detectChanges();

      expect(workerServiceSpy).toHaveBeenCalledWith('No');
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'delete-staff-record',
      ]);
      expect(alertServiceSpy).not.toHaveBeenCalled();
    });

    it('should return an error message if a user clicks submit without selecting a radio button', async () => {
      const { fixture, getByText, getAllByText, routerSpy, alertServiceSpy, workerService } = await setup();

      const continueButton = getByText('Continue');
      const workerServiceSpy = spyOn(workerService, 'setDoYouWantToDownloadTrainAndQualsAnswer');

      fireEvent.click(continueButton);
      fixture.detectChanges();

      expect(workerServiceSpy).not.toHaveBeenCalled();
      expect(getByText('There is a problem')).toBeTruthy();
      expect(getAllByText('Select Yes if you want to download the summary and any certificates')).toHaveSize(2);
      expect(routerSpy).not.toHaveBeenCalled();
      expect(alertServiceSpy).not.toHaveBeenCalled();
    });
  });

  describe('download all certificates', () => {
    it('should download all training and qualification certificates for the worker when clicked', async () => {
      const { component, getByText, fixture, trainingCertificateService, qualificationCertificateService } =
        await setup();

      spyOn(trainingCertificateService, 'downloadAllCertificatesAsBlobs').and.callThrough();
      spyOn(qualificationCertificateService, 'downloadAllCertificatesAsBlobs').and.callThrough();

      const continueButton = getByText('Continue');

      fireEvent.click(getByText(yesRadio));
      fireEvent.click(continueButton);
      fixture.detectChanges();

      expect(trainingCertificateService.downloadAllCertificatesAsBlobs).toHaveBeenCalledWith(
        component.workplace.uid,
        component.worker.uid,
      );
      expect(qualificationCertificateService.downloadAllCertificatesAsBlobs).toHaveBeenCalledWith(
        component.workplace.uid,
        component.worker.uid,
      );
    });

    it('should call saveFilesAsZip with all the downloaded certificates', async () => {
      const { component, fixture, getByText } = await setup();

      const expectedZipFileName = `All certificates - ${component.worker.nameOrId}.zip`;

      const fileUtilSpy = spyOn(FileUtil, 'saveFilesAsZip').and.callThrough();

      const continueButton = getByText('Continue');

      fireEvent.click(getByText(yesRadio));
      fireEvent.click(continueButton);
      fixture.detectChanges();

      expect(fileUtilSpy).toHaveBeenCalled();

      const contentsOfZipFile = fileUtilSpy.calls.mostRecent().args[0];
      const nameOfZipFile = fileUtilSpy.calls.mostRecent().args[1];

      expect(nameOfZipFile).toEqual(expectedZipFileName);

      mockTrainingCertificates.forEach((certificate) => {
        expect(contentsOfZipFile).toContain(
          jasmine.objectContaining({
            filename: 'Training certificates/' + certificate.filename,
            fileBlob: mockCertificateFileBlob,
          }),
        );
      });
      mockQualificationCertificates.forEach((certificate) => {
        expect(contentsOfZipFile).toContain(
          jasmine.objectContaining({
            filename: 'Qualification certificates/' + certificate.filename,
            fileBlob: mockCertificateFileBlob,
          }),
        );
      });
    });

    it('should not start a new download on click if still downloading certificates in the background', async () => {
      const { getByText, fixture, trainingCertificateService, qualificationCertificateService } = await setup();

      spyOn(trainingCertificateService, 'downloadAllCertificatesAsBlobs').and.callThrough();
      spyOn(qualificationCertificateService, 'downloadAllCertificatesAsBlobs').and.callThrough();

      const continueButton = getByText('Continue');

      fireEvent.click(getByText(yesRadio));
      fireEvent.click(continueButton);
      fixture.detectChanges();

      expect(trainingCertificateService.downloadAllCertificatesAsBlobs).toHaveBeenCalledTimes(1);
      expect(qualificationCertificateService.downloadAllCertificatesAsBlobs).toHaveBeenCalledTimes(1);
    });
  });

  describe('downloadTrainingAndQualsPdfWhenDeleteStaff', async () => {
    it('should download the training and qualifications records when the yes is clicked', async () => {
      const { component, getByText, PdfMakeServiceInject, fixture } = await setup();
      const downloadFunctionSpy = spyOn(component, 'downloadTrainingAndQualsPdfWhenDeleteStaff').and.callThrough();
      spyOn(component, 'downloadAllCertificates').and.resolveTo(true);

      const pdfTrainingAndQualsServiceSpy = spyOn(
        PdfMakeServiceInject,
        'generateTrainingAndQualifications',
      ).and.callThrough();

      const continueButton = getByText('Continue');

      fireEvent.click(getByText(yesRadio));
      fireEvent.click(continueButton);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(downloadFunctionSpy).toHaveBeenCalled();
      expect(pdfTrainingAndQualsServiceSpy).toHaveBeenCalled();
    });
  });
});
