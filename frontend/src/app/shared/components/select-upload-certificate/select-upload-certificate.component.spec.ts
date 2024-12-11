import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { SelectUploadCertificateComponent } from './select-upload-certificate.component';

describe('SelectUploadCertificateComponent', () => {
  let filesToUpload = [];
  beforeEach(() => {
    filesToUpload = [];
  });

  const setup = async (inputOverride: any = {}) => {
    const mockOnSelectFiles = (files: File[]) => {
      filesToUpload.push(...files);
    };

    const { fixture, getByText, getByTestId, getByRole } = await render(SelectUploadCertificateComponent, {
      imports: [SharedModule],
      componentProperties: {
        onSelectFiles: mockOnSelectFiles,
        filesToUpload,
        ...inputOverride,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getByRole,
      getByTestId,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render a subheading', async () => {
    const { getByRole } = await setup();
    expect(getByRole('heading', { name: 'Certificates' })).toBeTruthy;
  });

  describe('Upload file button', () => {
    it('should render a file input element', async () => {
      const { getByTestId } = await setup();

      const fileInput = getByTestId('fileInput');
      expect(fileInput).toBeTruthy();
    });

    it('should render "No file chosen" beside the file input', async () => {
      const { getByText } = await setup();
      const text = getByText('No file chosen');
      expect(text).toBeTruthy();
    });

    it('should not render "No file chosen" when a file is chosen', async () => {
      const { fixture, getByTestId } = await setup();

      const uploadSection = getByTestId('uploadCertificate');
      const fileInput = getByTestId('fileInput');

      userEvent.upload(fileInput, new File(['some file content'], 'cert.pdf'));

      fixture.detectChanges();

      const text = within(uploadSection).queryByText('No file chosen');
      expect(text).toBeFalsy();
    });

    it('should provide aria description to screen reader users', async () => {
      const { fixture, getByTestId } = await setup();
      fixture.autoDetectChanges();

      const uploadSection = getByTestId('uploadCertificate');
      const fileInput = getByTestId('fileInput');

      let uploadButton = within(uploadSection).getByRole('button', {
        description: /The certificate must be a PDF file that's no larger than 5MB/,
      });
      expect(uploadButton).toBeTruthy();

      userEvent.upload(fileInput, new File(['some file content'], 'cert.pdf'));

      uploadButton = within(uploadSection).getByRole('button', {
        description: '1 file chosen',
      });
      expect(uploadButton).toBeTruthy();
    });
  });
});
