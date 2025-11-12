import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { BulkUploadFileType, ValidatedFile } from '@core/model/bulk-upload.model';
import { Establishment } from '@core/model/establishment.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import {
  EstablishmentFile,
  MockBulkUploadService,
  OtherFile,
  TrainingFile,
  WorkerFile,
} from '@core/test-utils/MockBulkUploadService';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { BulkUploadModule } from '@features/bulk-upload/bulk-upload.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { BehaviorSubject, of } from 'rxjs';
import { environment } from 'src/environments/environment';

import { DragAndDropFilesListComponent } from './drag-and-drop-files-list.component';
import { AdminSkipService } from '../admin-skip.service';

describe('DragAndDropFilesListComponent', () => {
  const setup = async (overrides: any = {}) => {
    const { fixture, getByTestId, getByText, queryByText, getAllByText } = await render(DragAndDropFilesListComponent, {
      imports: [SharedModule, RouterModule, BulkUploadModule],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: BulkUploadService,
          useFactory: MockBulkUploadService.factory(overrides.bulkUploadService),
          deps: [HttpClient, EstablishmentService, UserService],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        AdminSkipService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      componentProperties: {
        sanitise: true,
        hasTrainingCertificates: overrides.hasTrainingCertificates ?? false,
      },
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router) as Router;
    const http = TestBed.inject(HttpTestingController);

    const bulkUploadService = injector.inject(BulkUploadService);
    const bulkUploadServiceSpy = spyOn(bulkUploadService, 'getUploadedFileFromS3').and.callThrough();

    return {
      component,
      fixture,
      getByTestId,
      getByText,
      queryByText,
      getAllByText,
      establishmentService,
      router,
      http,
      bulkUploadService,
      bulkUploadServiceSpy,
    };
  };

  it('should render a DragAndDropFilesListComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should pass if there are two files', async () => {
    const { component, fixture } = await setup();
    const dummyFiles = [EstablishmentFile, WorkerFile];
    component.uploadedFiles = dummyFiles as ValidatedFile[];
    component.preValidateCheck();
    fixture.detectChanges();
    expect(component.preValidationErrorMessage).toEqual('');
  });

  it('should change the error message if there are no files', async () => {
    const { component, fixture, getByTestId } = await setup();
    const dummyFiles = [];
    component.uploadedFiles = dummyFiles as ValidatedFile[];
    component.preValidateCheck();
    fixture.detectChanges();
    const validationMsg = getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain('You need to select 2 or 3 files.');
  });

  it('should change the error message if are more than 3 files', async () => {
    const { component, fixture, getByTestId } = await setup();
    const dummyFiles = [EstablishmentFile, TrainingFile, WorkerFile, OtherFile];
    component.uploadedFiles = dummyFiles as ValidatedFile[];
    component.preValidateCheck();
    fixture.detectChanges();
    const validationMsg = getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain('You can only upload 2 or 3 files.');
  });

  it('should show an error message if there are two of the same type', async () => {
    const { component, fixture, getByTestId } = await setup();

    const dummyFiles = [EstablishmentFile, EstablishmentFile];
    component.uploadedFiles = dummyFiles as ValidatedFile[];
    component.preValidateCheck();
    fixture.detectChanges();
    const validationMsg = getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain('You can only upload 1 of each file type.');
  });

  it('should show an error message if there is a invalid csv', async () => {
    const { component, fixture, getByTestId } = await setup();

    component.uploadedFiles = [OtherFile, EstablishmentFile] as ValidatedFile[];
    component.preValidateCheck();
    fixture.detectChanges();
    const validationMsg = getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain(
      "This file was not recognised. Use the guidance to check it's set up correctly.",
    );
  });

  it('should show invalid file type error before duplicate error', async () => {
    const { component, fixture, getByTestId } = await setup();

    component.uploadedFiles = [OtherFile, EstablishmentFile, EstablishmentFile] as ValidatedFile[];
    component.preValidateCheck();
    fixture.detectChanges();
    const validationMsg = getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain(
      "This file was not recognised. Use the guidance to check it's set up correctly.",
    );
  });

  it("should display the file type error message when workplace file isn't uploaded", async () => {
    const { component, fixture, getByTestId } = await setup();
    const dummyFiles = [WorkerFile, TrainingFile];
    component.uploadedFiles = dummyFiles as ValidatedFile[];
    component.preValidateCheck();
    fixture.detectChanges();
    const validationMsg = getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain('You need to select your workplace file.');
  });

  it("should display the file type error message when staff file isn't uploaded and there is only one file", async () => {
    const { component, fixture, getByTestId } = await setup();
    const dummyFiles = [EstablishmentFile];
    component.uploadedFiles = dummyFiles as ValidatedFile[];
    component.preValidateCheck();
    fixture.detectChanges();
    const validationMsg = getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain('You need to select your staff file.');
  });

  it('should display the file type error message when only training file is uploaded', async () => {
    const { component, fixture, getByTestId } = await setup();
    const dummyFiles = [TrainingFile];
    component.uploadedFiles = dummyFiles as ValidatedFile[];
    component.preValidateCheck();
    fixture.detectChanges();
    const validationMsg = getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain('You need to select your workplace and staff files.');
  });

  it('calls complete in the bulk upload service with the correct uid', async () => {
    const { component, fixture, getByText, bulkUploadService } = await setup();

    const bulkUploadCompleteSpy = spyOn(bulkUploadService, 'complete').and.callFake(() => of({}));

    const dummyFiles = [WorkerFile, TrainingFile, EstablishmentFile];
    component.uploadedFiles = dummyFiles as ValidatedFile[];
    component.validationComplete = true;
    fixture.detectChanges();

    const button = getByText('Complete the upload');
    fireEvent.click(button);

    expect(bulkUploadCompleteSpy).toHaveBeenCalledWith('98a83eef-e1e1-49f3-89c5-b1287a3cc8de');
  });

  it('sets state in the establishment service when upload successfully completed', async () => {
    const { component, fixture, getByText, bulkUploadService, establishmentService } = await setup();
    const workplace = establishmentBuilder() as Establishment;
    spyOn(bulkUploadService, 'complete').and.callFake(() => of({}));
    const getEstablishmentSpy = spyOn(establishmentService, 'getEstablishment').and.callFake(() => of(workplace));
    const setWorkplaceSpy = spyOn(establishmentService, 'setWorkplace').and.callFake(() => {});
    const setPrimaryWorkplaceSpy = spyOn(establishmentService, 'setPrimaryWorkplace').and.callFake(() => {});
    const setCheckForChildWorkplaceChangesSpy = spyOn(
      establishmentService,
      'setCheckForChildWorkplaceChanges',
    ).and.callFake(() => {});

    const dummyFiles = [WorkerFile, TrainingFile, EstablishmentFile];
    component.uploadedFiles = dummyFiles as ValidatedFile[];
    component.validationComplete = true;
    fixture.detectChanges();

    const button = getByText('Complete the upload');
    fireEvent.click(button);

    expect(getEstablishmentSpy).toHaveBeenCalledWith('98a83eef-e1e1-49f3-89c5-b1287a3cc8de');
    expect(setWorkplaceSpy).toHaveBeenCalledWith(workplace);
    expect(setPrimaryWorkplaceSpy).toHaveBeenCalledWith(workplace);
    expect(setCheckForChildWorkplaceChangesSpy).toHaveBeenCalledWith(true);
  });

  describe('DownloadContent', () => {
    it('should call getUploadedFileFromS3 with the StaffSanitise file type when the staff link is clicked and sanitise is true', async () => {
      const { component, fixture, bulkUploadServiceSpy, getByText, establishmentService } = await setup();

      const workerFile = {
        ...WorkerFile,
        key: '1/bulkUpload/2022-01-01-sfc-bu-staff.csv',
        filename: '2022-01-01-sfc-bu-staff.csv',
      };
      const dummyFiles = [workerFile, TrainingFile, EstablishmentFile];

      component.uploadedFiles = dummyFiles as ValidatedFile[];
      fixture.detectChanges();

      const link = getByText(workerFile.filename);
      fireEvent.click(link);
      fixture.detectChanges();

      expect(bulkUploadServiceSpy).toHaveBeenCalledWith(
        establishmentService.primaryWorkplace.uid,
        workerFile.key,
        BulkUploadFileType.WorkerSanitise,
      );
    });

    it('should call getUploadedFileFromS3 with the Staff file type when the staff link is clicked and sanitise is false', async () => {
      const { component, fixture, bulkUploadServiceSpy, getByText, establishmentService } = await setup();

      const workerFile = {
        ...WorkerFile,
        key: '1/bulkUpload/2022-01-01-sfc-bu-staff.csv',
        filename: '2022-01-01-sfc-bu-staff.csv',
      };
      const dummyFiles = [workerFile, TrainingFile, EstablishmentFile];

      component.sanitise = false;
      component.uploadedFiles = dummyFiles as ValidatedFile[];
      fixture.detectChanges();

      const link = getByText(workerFile.filename);
      fireEvent.click(link);
      fixture.detectChanges();

      expect(bulkUploadServiceSpy).toHaveBeenCalledWith(
        establishmentService.primaryWorkplace.uid,
        workerFile.key,
        BulkUploadFileType.Worker,
      );
    });

    it("should call getUploadedFileFromS3 with the Staff file type when the staff link is clicked and sanitise is false and file name doesn't contain staff", async () => {
      const { component, fixture, bulkUploadServiceSpy, getByText, establishmentService } = await setup();

      const workerFile = {
        ...WorkerFile,
        key: '1/bulkUpload/S.csv',
        filename: 'S.csv',
      };
      const dummyFiles = [workerFile, TrainingFile, EstablishmentFile];

      component.sanitise = false;
      component.uploadedFiles = dummyFiles as ValidatedFile[];
      fixture.detectChanges();

      const link = getByText(workerFile.filename);
      fireEvent.click(link);
      fixture.detectChanges();

      expect(bulkUploadServiceSpy).toHaveBeenCalledWith(
        establishmentService.primaryWorkplace.uid,
        workerFile.key,
        BulkUploadFileType.Worker,
      );
    });

    it('should call getUploadedFileFromS3 with the Establishment file type when the staff link is clicked and sanitise is false', async () => {
      const { component, fixture, bulkUploadServiceSpy, getByText, establishmentService } = await setup();

      const establishmentFile = {
        ...EstablishmentFile,
        key: '1/bulkUpload/2022-01-01-sfc-bu-workplace.csv',
        filename: '2022-01-01-sfc-bu-workplace.csv',
      };
      const dummyFiles = [WorkerFile, TrainingFile, establishmentFile];

      component.uploadedFiles = dummyFiles as ValidatedFile[];
      fixture.detectChanges();

      const link = getByText(establishmentFile.filename);
      fireEvent.click(link);
      fixture.detectChanges();

      expect(bulkUploadServiceSpy).toHaveBeenCalledWith(
        establishmentService.primaryWorkplace.uid,
        establishmentFile.key,
        BulkUploadFileType.Establishment,
      );
    });

    it('should call getUploadedFileFromS3 with the Establishment file type when the staff link is clicked and sanitise is false', async () => {
      const { component, fixture, bulkUploadServiceSpy, getByText, establishmentService } = await setup();

      const trainingFile = {
        ...TrainingFile,
        key: '1/bulkUpload/2022-01-01-sfc-bu-training.csv',
        filename: '2022-01-01-sfc-bu-training.csv',
      };
      const dummyFiles = [WorkerFile, trainingFile, EstablishmentFile];

      component.uploadedFiles = dummyFiles as ValidatedFile[];
      fixture.detectChanges();

      const link = getByText(trainingFile.filename);
      fireEvent.click(link);
      fixture.detectChanges();

      expect(bulkUploadServiceSpy).toHaveBeenCalledWith(
        establishmentService.primaryWorkplace.uid,
        trainingFile.key,
        BulkUploadFileType.Training,
      );
    });
  });

  describe('DeleteFile', () => {
    it("should filter to only show files that haven't been deleted", async () => {
      const { component, fixture } = await setup();
      const event = new Event('click');
      const fileToDelete: ValidatedFile = {
        errors: 0,
        filename: 'filename',
        fileType: 'Establishment',
        key: '1',
        records: 10,
        size: 100,
        uploaded: '',
        warnings: 2,
        username: 'user',
      };
      const dummyFiles = [fileToDelete, EstablishmentFile, TrainingFile, WorkerFile];
      component.uploadedFiles = dummyFiles as ValidatedFile[];
      component.deleteFile(event, fileToDelete.filename);
      fixture.detectChanges();
      expect(component.uploadedFiles.length).toEqual(3);
      expect(component.uploadedFiles).not.toContain(fileToDelete);
    });

    it('should call the deleteFile function in BulkUploadService', async () => {
      const { component, http, fixture } = await setup();
      const event = new Event('click');
      const filenameToDelete = 'filename';
      const establishmentId = TestBed.inject(EstablishmentService).primaryWorkplace.uid;

      component.deleteFile(event, filenameToDelete);
      fixture.detectChanges();

      http.expectOne(
        `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/bulkupload/delete/${filenameToDelete}`,
      );
    });

    it('should should show validation as not complete after deleting a file and clear error message', async () => {
      const { component, fixture } = await setup();
      const event = new Event('click');
      const filenameToDelete = 'filename';

      component.validationComplete = true;
      component.preValidationErrorMessage = '';
      fixture.detectChanges();
      component.deleteFile(event, filenameToDelete);
      fixture.detectChanges();

      expect(component.validationComplete).toEqual(false);
      expect(component.preValidationErrorMessage).toEqual('');
    });
  });

  describe('Displaying training certificate deletion warning message', () => {
    const trainingCertificateDeletionWarningMessageLine1 =
      "Warning: If you've added training certificates to your training records, the certificates will be deleted when you upload the training file.";
    const trainingCertificateDeletionWarningMessageLine2 =
      'To keep the certificates, remove the training file from this bulk upload.';

    it('should display deletion warning message when user has training file uploaded and has training certificates', async () => {
      const overrides = {
        bulkUploadService: {
          uploadedFiles$: new BehaviorSubject([EstablishmentFile, TrainingFile, WorkerFile]),
        },
        hasTrainingCertificates: true,
      };

      const { getByText } = await setup(overrides);

      expect(getByText(trainingCertificateDeletionWarningMessageLine1)).toBeTruthy();
      expect(getByText(trainingCertificateDeletionWarningMessageLine2)).toBeTruthy();
    });

    it('should not display deletion message when user has training file uploaded but has no training certificates', async () => {
      const overrides = {
        bulkUploadService: {
          uploadedFiles$: new BehaviorSubject([EstablishmentFile, TrainingFile, WorkerFile]),
        },
        hasTrainingCertificates: false,
      };

      const { queryByText } = await setup(overrides);

      expect(queryByText(trainingCertificateDeletionWarningMessageLine1)).toBeFalsy();
      expect(queryByText(trainingCertificateDeletionWarningMessageLine2)).toBeFalsy();
    });

    it('should not display deletion message when user has training certificates but has not uploaded training file', async () => {
      const overrides = {
        bulkUploadService: {
          uploadedFiles$: new BehaviorSubject([EstablishmentFile, WorkerFile]),
        },
        hasTrainingCertificates: true,
      };

      const { queryByText } = await setup(overrides);

      expect(queryByText(trainingCertificateDeletionWarningMessageLine1)).toBeFalsy();
      expect(queryByText(trainingCertificateDeletionWarningMessageLine2)).toBeFalsy();
    });

    it('should remove deletion warning message when user deletes training file', async () => {
      const overrides = {
        bulkUploadService: {
          uploadedFiles$: new BehaviorSubject([EstablishmentFile, WorkerFile, TrainingFile]),
        },
        hasTrainingCertificates: true,
      };

      const { fixture, getAllByText, queryByText } = await setup(overrides);

      expect(queryByText(trainingCertificateDeletionWarningMessageLine1)).toBeTruthy();
      expect(queryByText(trainingCertificateDeletionWarningMessageLine2)).toBeTruthy();

      const fileDeleteButtons = getAllByText('Delete');
      userEvent.click(fileDeleteButtons[2]);

      fixture.detectChanges();
      expect(queryByText(trainingCertificateDeletionWarningMessageLine1)).toBeFalsy();
      expect(queryByText(trainingCertificateDeletionWarningMessageLine2)).toBeFalsy();
    });

    it('should not remove deletion warning message when user deletes a file which is not training', async () => {
      const overrides = {
        bulkUploadService: {
          uploadedFiles$: new BehaviorSubject([EstablishmentFile, WorkerFile, TrainingFile]),
        },
        hasTrainingCertificates: true,
      };

      const { fixture, getAllByText, queryByText } = await setup(overrides);

      expect(queryByText(trainingCertificateDeletionWarningMessageLine1)).toBeTruthy();

      const fileDeleteButtons = getAllByText('Delete');
      userEvent.click(fileDeleteButtons[0]);

      fixture.detectChanges();
      expect(queryByText(trainingCertificateDeletionWarningMessageLine1)).toBeTruthy();
      expect(queryByText(trainingCertificateDeletionWarningMessageLine2)).toBeTruthy();
    });
  });
});
