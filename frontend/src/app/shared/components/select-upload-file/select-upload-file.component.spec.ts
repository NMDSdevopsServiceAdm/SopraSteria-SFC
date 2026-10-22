import { NgxDropzoneModule } from 'ngx-dropzone';

import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { SelectUploadFileComponent } from './select-upload-file.component';
import { fireEvent, within } from '@testing-library/dom';

describe('SelectUploadFileComponent', () => {
  const setup = async (inputOverride = {}) => {
    const setupTools = await render(SelectUploadFileComponent, {
      imports: [SharedModule, NgxDropzoneModule],
      componentProperties: {
        ...inputOverride,
      },
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should display a button for file selection', async () => {
      const { getByRole } = await setup();
      const fileSelectButton = getByRole('button', { name: 'Choose file' });

      expect(fileSelectButton).toBeTruthy();
    });

    it('should create an invisible file input element for file selection', async () => {
      const { getByTestId } = await setup();
      const fileInput = getByTestId('fileInput');

      expect(fileInput).toBeTruthy();
      expect(fileInput.style.display).toBeFalsy();
    });

    it('should display the button with the provided button text', async () => {
      const { getByRole } = await setup({ buttonText: 'Upload file' });
      const fileSelectButton = getByRole('button', { name: 'Upload file' });

      expect(fileSelectButton).toBeTruthy();
    });

    it('should pass the `accept` and `multiple` attributes to the file input element underneath', async () => {
      const { getByTestId } = await setup({ accept: '.csv', multiple: 'true' });
      const fileInput = getByTestId('fileInput') as HTMLInputElement;

      expect(fileInput.accept).toEqual('.csv');
      expect(fileInput.multiple).toEqual(true);
    });
  });

  describe('File selection', () => {
    it('should trigger the fileInput by clicking the button', async () => {
      const { getByRole, getByTestId } = await setup();
      const fileSelectButton = getByRole('button', { name: 'Choose file' });
      const fileInput = getByTestId('fileInput');

      const spyFileInputClick = spyOn(fileInput, 'click').and.callThrough();

      userEvent.click(fileSelectButton);

      expect(spyFileInputClick).toHaveBeenCalledTimes(1);
    });

    it('should output the files that user has selected', async () => {
      const { getByTestId, component } = await setup({ multiple: true });
      const selectFilesSpy = spyOn(component.selectFiles, 'emit').and.callThrough();
      const fileInput = getByTestId('fileInput');

      const mockFile1 = new File(['some file content'], 'cert1.pdf', { type: 'application/pdf' });
      const mockFile2 = new File(['some file content'], 'cert2.pdf', { type: 'application/pdf' });

      userEvent.upload(fileInput, [mockFile1, mockFile2]);

      expect(selectFilesSpy).toHaveBeenCalledWith([mockFile1, mockFile2]);
    });
  });

  describe('drag and drop', () => {
    const overrides = {
      accept: '.csv',
      multiple: 'true',
      showDragAndDropZone: true,
      buttonText: 'Select file',
      dragAndDropZoneText: 'Drag and drop the certificate here',
    };

    it('should show a drag and drop zone when showDragAndDropZone is true', async () => {
      const { getByTestId } = await setup(overrides);

      const dragAndDropZone = getByTestId('dragAndDrop');
      expect(dragAndDropZone).toBeTruthy();

      const selectFileButton = within(dragAndDropZone).getByRole('button', { name: 'Select file' });
      expect(selectFileButton).toBeTruthy();

      expect(within(dragAndDropZone).getByText('Drag and drop the certificate here')).toBeTruthy();
    });

    it('should handle file drop event and call selectFiles emitter', async () => {
      const { component, fixture, getByTestId } = await setup(overrides);

      const selectFilesSpy = spyOn(component.selectFiles, 'emit').and.callThrough();

      const mockFile1 = new File(['some file content'], 'cert1.pdf', { type: 'application/pdf' });
      const mockFile2 = new File(['some file content'], 'cert2.pdf', { type: 'application/pdf' });
      const event = mockFileDropEvent([mockFile1, mockFile2]);

      const dragAndDropZone = getByTestId('dragAndDrop');
      fireEvent(dragAndDropZone, event);

      await fixture.whenStable();

      expect(selectFilesSpy).toHaveBeenCalledWith([mockFile1, mockFile2]);
    });

    const mockFileDropEvent = (files: File[]) => {
      const mockFileList = [...files];

      //@ts-ignore
      mockFileList.item = (index) => {
        return files[index];
      };
      const event = new Event('drop');
      //@ts-ignore
      event.dataTransfer = {
        files: mockFileList,
      };
      return event;
    };
  });
});
