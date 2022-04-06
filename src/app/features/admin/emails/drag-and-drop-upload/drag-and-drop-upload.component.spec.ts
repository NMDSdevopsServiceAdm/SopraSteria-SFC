import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { BrowserModule, By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { NgxDropzoneModule } from 'ngx-dropzone';

import { DragAndDropUploadComponent } from './drag-and-drop-upload.component';

describe('DragAndDropUploadComponent', () => {
  const getDragAndDropFilesUploadComponent = async () => {
    return await render(DragAndDropUploadComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, NgxDropzoneModule],
      providers: [FormBuilder],
      declarations: [DragAndDropUploadComponent],
    });
  };

  const setup = async () => {
    const component = await getDragAndDropFilesUploadComponent();
    const fixture = component.fixture;
    const compInst = component.fixture.componentInstance;
    const fileInput = fixture.debugElement.query(By.css('#drag-and-drop input'));
    const validFile = new File(['some file content'], 'establishments.csv');

    const triggerFileInput = () => {
      fileInput.triggerEventHandler('change', {
        target: {
          files: {
            item: () => {
              return validFile;
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

    return { fixture, component, compInst, triggerFileInput, triggerInvalidFileInput, http, validFile };
  };

  it('should dispatch event to handler on component', async () => {
    const { compInst, triggerFileInput } = await setup();
    spyOn(compInst, 'onSelect');

    triggerFileInput();

    expect(compInst.onSelect).toHaveBeenCalled();
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
    it('should emit a file upload event when a file is dropped onto the target', async () => {
      const { triggerFileInput, compInst, validFile } = await setup();

      const fileUploadEmitSpy = spyOn(compInst.fileUploadEvent, 'emit');
      triggerFileInput();

      expect(fileUploadEmitSpy).toHaveBeenCalledWith(validFile);
    });

    it('should not emit a file upload event when invalid file is dropped onto the target', async () => {
      const { triggerInvalidFileInput, compInst } = await setup();

      const fileUploadEmitSpy = spyOn(compInst.fileUploadEvent, 'emit');
      triggerInvalidFileInput();

      expect(fileUploadEmitSpy).not.toHaveBeenCalled();
    });
  });
});
