import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SelectUploadFileComponent } from './select-upload-file.component';
import userEvent from '@testing-library/user-event';

describe('SelectUploadFileComponent', () => {
  const setup = async (inputOverride = {}) => {
    const { fixture, getByTestId, getByRole } = await render(SelectUploadFileComponent, {
      imports: [SharedModule],
      componentProperties: {
        ...inputOverride,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByRole,
      getByTestId,
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
});
