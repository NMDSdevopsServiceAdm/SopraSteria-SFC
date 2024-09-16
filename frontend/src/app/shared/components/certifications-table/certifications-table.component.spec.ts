import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { CertificationsTableComponent } from './certifications-table.component';

describe('CertificationsTableComponent', () => {
  let single = [
    {
      uid: '396ae33f-a99b-4035-9f29-718529a54244',
      filename: 'first_aid.pdf',
      uploadDate: '2024-04-12T14:44:29.151Z',
    },
  ];

  let multipleFiles = [];

  const setup = async (files = []) => {
    const { fixture, getByText, getByTestId } = await render(CertificationsTableComponent, {
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
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the file name and upload date table header', async () => {
    const { component, getByText, getByTestId } = await setup();

    const certificationsTableHeader = getByTestId('certificationsTableHeader');

    expect(certificationsTableHeader).toBeTruthy();
    expect(within(certificationsTableHeader).getByText('File name')).toBeTruthy();
    expect(within(certificationsTableHeader).getByText('Upload date')).toBeTruthy();
    expect(within(certificationsTableHeader).getByText('Download all')).toBeTruthy();
  });

  it('should show a row of for a single file', async () => {
    const { component, getByText } = await setup(single);

    expect(getByText('first_aid.pdf')).toBeTruthy();
  });
});
