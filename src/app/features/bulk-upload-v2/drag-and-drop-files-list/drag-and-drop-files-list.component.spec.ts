import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ValidatedFile } from '@core/model/bulk-upload.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { EstablishmentFile, OtherFile, TrainingFile, WorkerFile } from '@core/test-utils/MockBulkUploadService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { BulkUploadModule } from '@features/bulk-upload-v2/bulk-upload.module';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { DragAndDropFilesListComponent } from './drag-and-drop-files-list.component';

describe('DragAndDropFilesListComponent', () => {
  async function setup() {
    const component = await render(DragAndDropFilesListComponent, {
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
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router) as Router;
    const http = TestBed.inject(HttpTestingController);

    return {
      component,
      establishmentService,
      router,
      http,
    };
  }

  it('should render a DragAndDropFilesListComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should pass if there are two files', async () => {
    const { component } = await setup();
    const dummyFiles = [EstablishmentFile, WorkerFile];
    component.fixture.componentInstance.uploadedFiles = dummyFiles as ValidatedFile[];
    component.fixture.componentInstance.preValidateCheck();
    component.fixture.detectChanges();
    expect(component.fixture.componentInstance.preValidationErrorMessage).toEqual('');
  });

  it('should change the error message if there are no files', async () => {
    const { component } = await setup();
    const dummyFiles = [];
    component.fixture.componentInstance.uploadedFiles = dummyFiles as ValidatedFile[];
    component.fixture.componentInstance.preValidateCheck();
    component.fixture.detectChanges();
    const validationMsg = component.getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain('You need to select 2 or 3 files.');
  });

  it('should change the error message if are more than 3 files', async () => {
    const { component } = await setup();
    const dummyFiles = [EstablishmentFile, TrainingFile, WorkerFile, OtherFile];
    component.fixture.componentInstance.uploadedFiles = dummyFiles as ValidatedFile[];
    component.fixture.componentInstance.preValidateCheck();
    component.fixture.detectChanges();
    const validationMsg = component.getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain('You can only upload 2 or 3 files.');
  });

  it('should show an error message if there are two of the same type', async () => {
    const { component } = await setup();

    const dummyFiles = [EstablishmentFile, EstablishmentFile];
    component.fixture.componentInstance.uploadedFiles = dummyFiles as ValidatedFile[];
    component.fixture.componentInstance.preValidateCheck();
    component.fixture.detectChanges();
    const validationMsg = component.getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain('You can only upload 1 of each file type.');
  });

  it('should show an error message if there is a invalid csv', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.uploadedFiles = [OtherFile, EstablishmentFile] as ValidatedFile[];
    component.fixture.componentInstance.preValidateCheck();
    component.fixture.detectChanges();
    const validationMsg = component.getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain(
      "This file was not recognised.  Use the guidance to check it's set up correctly.",
    );
  });

  it('should show invalid file type error before duplicate error', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.uploadedFiles = [
      OtherFile,
      EstablishmentFile,
      EstablishmentFile,
    ] as ValidatedFile[];
    component.fixture.componentInstance.preValidateCheck();
    component.fixture.detectChanges();
    const validationMsg = component.getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain(
      "This file was not recognised.  Use the guidance to check it's set up correctly.",
    );
  });

  it("should display the file type error message when workplace file isn't uploaded", async () => {
    const { component } = await setup();
    const dummyFiles = [WorkerFile, TrainingFile];
    component.fixture.componentInstance.uploadedFiles = dummyFiles as ValidatedFile[];
    component.fixture.componentInstance.preValidateCheck();
    component.fixture.detectChanges();
    const validationMsg = component.getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain('You need to select your workplace file.');
  });

  it("should display the file type error message when staff file isn't uploaded and there is only one file", async () => {
    const { component } = await setup();
    const dummyFiles = [EstablishmentFile];
    component.fixture.componentInstance.uploadedFiles = dummyFiles as ValidatedFile[];
    component.fixture.componentInstance.preValidateCheck();
    component.fixture.detectChanges();
    const validationMsg = component.getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain('You need to select your staff file.');
  });

  it('should display the file type error message when only training file is uploaded', async () => {
    const { component } = await setup();
    const dummyFiles = [TrainingFile];
    component.fixture.componentInstance.uploadedFiles = dummyFiles as ValidatedFile[];
    component.fixture.componentInstance.preValidateCheck();
    component.fixture.detectChanges();
    const validationMsg = component.getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain('You need to select your workplace and staff files.');
  });

  describe('DeleteFile', () => {
    it("should filter to only show files that haven't been deleted", async () => {
      const { component } = await setup();
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
      component.fixture.componentInstance.uploadedFiles = dummyFiles as ValidatedFile[];
      component.fixture.componentInstance.deleteFile(event, fileToDelete.filename);
      component.fixture.detectChanges();
      expect(component.fixture.componentInstance.uploadedFiles.length).toEqual(3);
      expect(component.fixture.componentInstance.uploadedFiles).not.toContain(fileToDelete);
    });

    it('should call the deleteFile function in BulkUploadService', async () => {
      const { component, http } = await setup();
      const event = new Event('click');
      const filenameToDelete = 'filename';
      const establishmentId = TestBed.inject(EstablishmentService).primaryWorkplace.uid;

      component.fixture.componentInstance.deleteFile(event, filenameToDelete);
      component.fixture.detectChanges();

      http.expectOne(`/api/establishment/${establishmentId}/bulkupload/delete/${filenameToDelete}`);
    });

    it('should should show validation as not complete after deleting a file and clear error message', async () => {
      const { component } = await setup();
      const event = new Event('click');
      const filenameToDelete = 'filename';

      component.fixture.componentInstance.validationComplete = true;
      component.fixture.componentInstance.preValidationErrorMessage = '';
      component.fixture.detectChanges();
      component.fixture.componentInstance.deleteFile(event, filenameToDelete);
      component.fixture.detectChanges();

      expect(component.fixture.componentInstance.validationComplete).toEqual(false);
      expect(component.fixture.componentInstance.preValidationErrorMessage).toEqual('');
    });
  });
});
