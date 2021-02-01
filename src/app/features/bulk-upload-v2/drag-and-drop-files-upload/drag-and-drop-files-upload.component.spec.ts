import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BulkUploadService, BulkUploadServiceV2 } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { render } from '@testing-library/angular';

import { BulkUploadV2Module } from '../bulk-upload.module';
import { DragAndDropFilesUploadComponent } from './drag-and-drop-files-upload.component';

describe('DragAndDropFilesUploadComponent', () => {
  const getDragAndDropFilesUploadComponent = async () => {
    return await render(DragAndDropFilesUploadComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, BulkUploadV2Module],
      providers: [
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: BulkUploadService, useClass: BulkUploadServiceV2 },
      ],
      declarations: [DragAndDropFilesUploadComponent],
    });
  };

  const setup = async () => {
    const { fixture } = await getDragAndDropFilesUploadComponent();
    const component = fixture.componentInstance;
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

    return { fixture, component, triggerFileInput,triggerInvalidFileInput, http };
  };

  describe('ngx dropzone', () => {
    it('should dispatch event to handler on component', async () => {
      const { component, triggerFileInput } = await setup();

      spyOn(component, 'onSelect');

      triggerFileInput();

      expect(component.onSelect).toHaveBeenCalled();
    });
  });

  it('should display Error if wrong type uploaded', async () => {
    const { component, triggerInvalidFileInput} = await setup();

    triggerInvalidFileInput();

    expect(component.showInvalidFileError).toEqual(true);
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
