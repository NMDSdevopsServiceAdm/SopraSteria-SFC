import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { CertificationsTableComponent } from './certifications-table.component';
import userEvent from '@testing-library/user-event';

describe('CertificationsTableComponent', () => {
  let singleFile = [
    {
      uid: 'uid-1',
      filename: 'first_aid.pdf',
      uploadDate: '2024-04-12T14:44:29.151',
    },
  ];

  let multipleFiles = [
    {
      uid: 'uid-1',
      filename: 'first_aid.pdf',
      uploadDate: '2024-04-12T14:44:29.151',
    },
    {
      uid: 'uid-2',
      filename: 'first_aid.pdf_v2',
      uploadDate: '2024-05-12T14:44:29.151',
    },
    {
      uid: 'uid-3',
      filename: 'first_aid.pdf_v3',
      uploadDate: '2024-06-12T14:44:29.151',
    },
  ];

  const setup = async (files = [], uploadFiles = []) => {
    const { fixture, getByText, getByTestId, queryByText, queryByTestId } = await render(CertificationsTableComponent, {
      imports: [SharedModule],
      componentProperties: {
        certificates: files,
        uploadFiles,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByText,
      queryByTestId,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('table header', () => {
    it('should show the file name and upload date', async () => {
      const { getByTestId } = await setup(multipleFiles);

      const certificationsTableHeader = getByTestId('certificationsTableHeader');

      expect(certificationsTableHeader).toBeTruthy();
      expect(within(certificationsTableHeader).getByText('File name')).toBeTruthy();
      expect(within(certificationsTableHeader).getByText('Upload date')).toBeTruthy();
      expect(within(certificationsTableHeader).getByText('Download all')).toBeTruthy();
    });

    it('should not show the file name and upload date if there is no certificates', async () => {
      const { queryByTestId } = await setup();

      const certificationsTableHeader = queryByTestId('certificationsTableHeader');

      expect(certificationsTableHeader).toBeFalsy();
    });

    describe('download all', () => {
      it('should show if there is more than one file', async () => {
        const { getByTestId } = await setup(multipleFiles);

        const certificationsTableHeader = getByTestId('certificationsTableHeader');

        expect(within(certificationsTableHeader).getByText('Download all')).toBeTruthy();
      });

      it('should not show if there is only one file', async () => {
        const { getByTestId } = await setup(singleFile);

        const certificationsTableHeader = getByTestId('certificationsTableHeader');

        expect(within(certificationsTableHeader).queryByText('Download all')).toBeFalsy();
      });
    });
  });

  it('should show a row of for a single file', async () => {
    const { getByTestId } = await setup(singleFile);

    const certificateRow = getByTestId('certificate-row-0');

    expect(certificateRow).toBeTruthy();
    expect(within(certificateRow).getByText('first_aid.pdf')).toBeTruthy();
    expect(within(certificateRow).getByText('12 Apr 2024, 2:44pm')).toBeTruthy();
    expect(within(certificateRow).getByText('Download')).toBeTruthy();
    expect(within(certificateRow).getByText('Remove')).toBeTruthy();
  });

  it('should show multiple rows for multiple files', async () => {
    const { getByTestId } = await setup(multipleFiles);

    expect(getByTestId('certificate-row-0')).toBeTruthy();
    expect(getByTestId('certificate-row-1')).toBeTruthy();
    expect(getByTestId('certificate-row-2')).toBeTruthy();
  });

  describe('Files to upload', () => {
    const mockUploadFiles = ['new file1.pdf', 'new file2.pdf'].map(
      (filename) => new File(['some file content'], filename, { type: 'application/pdf' }),
    );

    it('should show the file names for the new files to be uploaded', async () => {
      const { getByTestId } = await setup([], mockUploadFiles);

      mockUploadFiles.forEach((file, index) => {
        const uploadFileRow = getByTestId(`upload-file-row-${index}`);
        expect(uploadFileRow).toBeTruthy();
        expect(within(uploadFileRow).getByText(file.name)).toBeTruthy();
        expect(within(uploadFileRow).getByText('Remove')).toBeTruthy();
      });
    });

    it('should not show download buttons or download all button', async () => {
      const { queryByText } = await setup([], mockUploadFiles);

      expect(queryByText('Download all')).toBeFalsy();
      expect(queryByText('Download')).toBeFalsy();
    });

    it('should co-exist with the already uploaded files', async () => {
      const { getByTestId } = await setup(multipleFiles, mockUploadFiles);

      expect(getByTestId('upload-file-row-0')).toBeTruthy();
      expect(getByTestId('upload-file-row-1')).toBeTruthy();
      expect(getByTestId('certificate-row-0')).toBeTruthy();
      expect(getByTestId('certificate-row-1')).toBeTruthy();
      expect(getByTestId('certificate-row-2')).toBeTruthy();
    });

    it('should call removeUploadFile with file index when the remove button for upload file is clicked', async () => {
      const { getByTestId, component } = await setup([], mockUploadFiles);
      const uploadFileRow = getByTestId('upload-file-row-1');

      const removeUploadFileSpy = spyOn(component.removeUploadFile, 'emit');

      const removeButton = within(uploadFileRow).getByText('Remove');
      userEvent.click(removeButton);

      expect(removeUploadFileSpy).toHaveBeenCalledWith(1);
    });
  });
});
