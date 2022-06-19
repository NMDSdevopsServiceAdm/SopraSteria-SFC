import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BulkUploadFileType, ValidatedFile } from '@core/model/bulk-upload.model';
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
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { BulkUploadModule } from '@features/bulk-upload/bulk-upload.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { DragAndDropFilesListComponent } from './drag-and-drop-files-list.component';

describe('DragAndDropFilesListComponent', () => {
  const setup = async () => {
    const { fixture, getByTestId, getByText } = await render(DragAndDropFilesListComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, BulkUploadModule],
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
          useClass: MockBulkUploadService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
      componentProperties: {
        sanitise: true,
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

  it('calls complete in the bulk upload service with the correct uid, and then updates the establishment service', async () => {
    const { component, fixture, getByText, bulkUploadService, establishmentService } = await setup();

    const bulkUploadCompleteSpy = spyOn(bulkUploadService, 'complete').and.callFake(() => of({}));
    const establishmentGetEstablishmentSpy = spyOn(establishmentService, 'getEstablishment').and.callThrough();

    const dummyFiles = [WorkerFile, TrainingFile, EstablishmentFile];
    component.uploadedFiles = dummyFiles as ValidatedFile[];
    component.validationComplete = true;
    fixture.detectChanges();

    const button = getByText('Complete the upload');
    fireEvent.click(button);

    expect(bulkUploadCompleteSpy).toHaveBeenCalledWith('98a83eef-e1e1-49f3-89c5-b1287a3cc8de');
    expect(establishmentGetEstablishmentSpy).toHaveBeenCalledWith('98a83eef-e1e1-49f3-89c5-b1287a3cc8de');
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

      http.expectOne(`/api/establishment/${establishmentId}/bulkupload/delete/${filenameToDelete}`);
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
});
