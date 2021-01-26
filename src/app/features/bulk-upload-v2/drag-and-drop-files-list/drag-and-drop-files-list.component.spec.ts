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
import { ValidatedFile as ValFile } from '@core/test-utils/MockBulkUploadService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { BulkUploadV2Module } from '@features/bulk-upload-v2/bulk-upload.module';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { DragAndDropFilesListComponent } from './drag-and-drop-files-list.component';

describe('DragAndDropFilesListComponent', () => {
  async function setup() {
    const component = await render(DragAndDropFilesListComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, BulkUploadV2Module],
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
    const dummyFiles = [ValFile, ValFile];
    component.fixture.componentInstance.uploadedFiles = dummyFiles;
    component.fixture.componentInstance.preValidateCheck();
    component.fixture.detectChanges();
    expect(component.fixture.componentInstance.preValidationErrorMessage).toEqual('');
  });

  it('should change the error message if there is only one file', async () => {
    const { component } = await setup();
    const dummyFiles = [ValFile];
    component.fixture.componentInstance.uploadedFiles = dummyFiles;
    component.fixture.componentInstance.preValidateCheck();
    component.fixture.detectChanges();
    const validationMsg = component.getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain('You need to select 2 or 3 files.');
    expect(component.fixture.componentInstance.preValidationErrorMessage).toEqual('You need to select 2 or 3 files.');
  });

  it('should change the error message if are more than 3 files', async () => {
    const { component } = await setup();
    const dummyFiles = [ValFile, ValFile, ValFile, ValFile];
    component.fixture.componentInstance.uploadedFiles = dummyFiles;
    component.fixture.componentInstance.preValidateCheck();
    component.fixture.detectChanges();
    const validationMsg = component.getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain('You can only upload 2 or 3 files.');
    expect(component.fixture.componentInstance.preValidationErrorMessage).toEqual('You can only upload 2 or 3 files.');
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
      const dummyFiles = [fileToDelete, ValFile, ValFile, ValFile];
      component.fixture.componentInstance.uploadedFiles = dummyFiles;
      component.fixture.componentInstance.deleteFile(event, fileToDelete.filename);
      component.fixture.detectChanges();
      expect(component.fixture.componentInstance.uploadedFiles.length).toEqual(3);
      expect(component.fixture.componentInstance.uploadedFiles).not.toContain(fileToDelete);
    });

    xit('should call the deleteFile function in BulkUploadService', async () => {
      const { component, http } = await setup();
      const event = new Event('click');
      const filenameToDelete = 'filename';
      const establishmentId = TestBed.inject(EstablishmentService).establishmentId;

      component.fixture.componentInstance.deleteFile(event, filenameToDelete);
      component.fixture.detectChanges();

      http.expectOne(`/api/establishment//bulkupload/delete/${filenameToDelete}`);
    });
  });
});
