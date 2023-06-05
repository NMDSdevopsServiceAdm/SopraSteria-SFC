import { fireEvent, render } from '@testing-library/angular';
import { spy } from 'sinon';

import { DownloadPdfComponent } from './download-pdf.component';

describe('DownloadPdfComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId } = await render(DownloadPdfComponent, {
      imports: [],
      declarations: [],
      providers: [],
      componentProperties: {
        downloadPDF: {
          emit: spy(),
        } as any,
      },
    });

    const component = fixture.componentInstance;
    const toggleViewSpy = spyOn(component.downloadPDF, 'emit').and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      toggleViewSpy,
    };
  }

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should emit printPdf when the download link is clicked', async () => {
    const { component, getByTestId, toggleViewSpy } = await setup();

    const downloadLink = getByTestId('download-link');
    fireEvent.click(downloadLink);

    expect(toggleViewSpy).toHaveBeenCalled();
  });
});
