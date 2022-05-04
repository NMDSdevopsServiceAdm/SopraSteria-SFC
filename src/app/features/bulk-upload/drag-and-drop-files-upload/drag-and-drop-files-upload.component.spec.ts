import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BulkUploadService, BulkUploadServiceV2 } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { BulkUploadModule } from '../bulk-upload.module';
import { DragAndDropFilesUploadComponent } from './drag-and-drop-files-upload.component';

describe('DragAndDropFilesUploadComponent', () => {
  const getDragAndDropFilesUploadComponent = async () => {
    return await render(DragAndDropFilesUploadComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, BulkUploadModule],
      providers: [
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: BulkUploadService, useClass: BulkUploadServiceV2 },
      ],
      declarations: [DragAndDropFilesUploadComponent],
    });
  };

  const setup = async () => {
    const component = await getDragAndDropFilesUploadComponent();
    const fixture = component.fixture;
    const compInst = component.fixture.componentInstance;
    const fileInput = fixture.debugElement.query(By.css('#drag-and-drop input'));

    const triggerFileInput = () => {
      fileInput.triggerEventHandler('change', {
        target: {
          files: {
            item: () => {
              return new File(['some file content'], 'worker.csv');
            },
            length: 1,
          },
        },
        preventDefault: () => {
          // dummy function
        },
        stopPropagation: () => {
          // dummy function
        },
      });
    };

    const triggerInvalidFileInput = () => {
      fileInput.triggerEventHandler('change', {
        target: {
          files: {
            item: () => {
              return new File(['some file content'], 'Photo.png');
            },
            length: 1,
          },
        },
        preventDefault: () => {
          // dummy function
        },
        stopPropagation: () => {
          // dummy function
        },
      });
    };

    const http = TestBed.inject(HttpTestingController);

    return { fixture, component, compInst, triggerFileInput, triggerInvalidFileInput, http };
  };

  describe('ngx dropzone', () => {
    it('should dispatch event to handler on component', async () => {
      const { compInst, triggerFileInput } = await setup();
      spyOn(compInst, 'onSelect');

      triggerFileInput();

      expect(compInst.onSelect).toHaveBeenCalled();
    });
  });

  it('should display error if wrong type uploaded', async () => {
    const { component, fixture, triggerInvalidFileInput } = await setup();

    triggerInvalidFileInput();
    fixture.detectChanges();
    const validationMsg = component.getByTestId('validationErrorMsg');

    expect(validationMsg.innerHTML).toContain('You can only upload CSV files.');
  });

  it('should hide non-CSV error if wrong type uploaded and then valid file uploaded', async () => {
    const { component, fixture, triggerFileInput, triggerInvalidFileInput } = await setup();
    const nonCsvErrorMessage = 'You can only upload CSV files.';

    triggerInvalidFileInput();
    fixture.detectChanges();
    const validationMsg = component.getByTestId('validationErrorMsg');

    expect(validationMsg.innerHTML).toContain(nonCsvErrorMessage);

    triggerFileInput();
    fixture.detectChanges();
    expect(component.queryByText(nonCsvErrorMessage)).toBeFalsy();
  });

  describe('file upload', () => {
    it('should post the files to be uploaded', async () => {
      const { triggerFileInput, http } = await setup();

      triggerFileInput();

      const establishmentId = TestBed.inject(EstablishmentService).primaryWorkplace.uid;
      const requests = http.match(`/api/establishment/${establishmentId}/bulkupload/uploadFiles`);
      expect(requests.length).toEqual(1);
    });
  });
});
