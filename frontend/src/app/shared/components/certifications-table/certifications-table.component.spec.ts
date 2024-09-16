import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { CertificationsTableComponent } from './certifications-table.component';

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

  const setup = async (files = []) => {
    const { fixture, getByText, getByTestId, queryByText, queryByTestId } = await render(CertificationsTableComponent, {
      imports: [SharedModule],
      componentProperties: {
        certificates: files,
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

    it('should not show the file name and upload date if there a no certificates', async () => {
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
});
