import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { ValidatedFile } from '@core/test-utils/MockBulkUploadService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { DragAndDropFilesListComponent } from './drag-and-drop-files-list.component';

fdescribe('DragAndDropFilesListComponent', () => {
  async function setup() {
    const component = await render(DragAndDropFilesListComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
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

    return {
      component,
      establishmentService,
      router,
    };
  }

  it('should render a DragAndDropFilesListComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should pass if there are two files', async () => {
    const { component } = await setup();
    const dummyFiles = [ValidatedFile, ValidatedFile];
    component.fixture.componentInstance.uploadedFiles = dummyFiles;
    component.fixture.componentInstance.preValidateCheck();
    component.fixture.detectChanges();
    expect(component.fixture.componentInstance.preValidationErrorMessage).toEqual('');
  });

  it('should change the error message if there is only one file', async () => {
    const { component } = await setup();
    const dummyFiles = [ValidatedFile];
    component.fixture.componentInstance.uploadedFiles = dummyFiles;
    component.fixture.componentInstance.preValidateCheck();
    component.fixture.detectChanges();
    const validationMsg = component.getByTestId('validationErrorMsg');
    expect(validationMsg.innerHTML).toContain('You need to select 2 or 3 files.');
    expect(component.fixture.componentInstance.preValidationErrorMessage).toEqual('You need to select 2 or 3 files.');
  });

  it('should change the error message if are more than 3 files', async () => {
    const { component } = await setup();
    const dummyFiles = [ValidatedFile, ValidatedFile, ValidatedFile, ValidatedFile];
    component.fixture.componentInstance.uploadedFiles = dummyFiles;
    component.fixture.componentInstance.preValidateCheck();
    component.fixture.detectChanges();
    const validationMsg = component.getByTestId('validationErrorMsg');
    expect(component.fixture.componentInstance.preValidationErrorMessage).toEqual('You can only upload 2 or 3 files.');
    expect(validationMsg.innerHTML).toContain('You can only upload 2 or 3 files.');
  });
});
