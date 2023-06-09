import { fireEvent, render } from '@testing-library/angular';
import { spy } from 'sinon';

import { DownloadPdfComponent } from './download-pdf.component';

describe('DownloadPdfComponent', () => {
  const setup = async (viewBenchmarksByCategory = false) => {
    const { fixture, getByText, getByTestId, queryByTestId } = await render(DownloadPdfComponent, {
      imports: [],
      declarations: [],
      providers: [],
      componentProperties: {
        viewBenchmarksByCategory,
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
      queryByTestId,
      toggleViewSpy,
    };
  };

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the pay download link when viewBenchmarksByCategory is false', async () => {
    const { getByTestId, queryByTestId } = await setup();

    expect(getByTestId('payDownloadLink')).toBeTruthy();
    expect(queryByTestId('rAndRDownloadLink')).toBeFalsy;
  });

  it('should render the recruiment and retention download link when viewBenchmarksByCategory is true', async () => {
    const { getByTestId, queryByTestId } = await setup(true);

    expect(getByTestId('rAndRDownloadLink')).toBeTruthy();
    expect(queryByTestId('payDownloadLink')).toBeFalsy;
  });

  it('should emit printPdf when the download link is clicked', async () => {
    const { getByTestId, toggleViewSpy } = await setup();

    const downloadLink = getByTestId('download-link');
    fireEvent.click(downloadLink);

    expect(toggleViewSpy).toHaveBeenCalled();
  });
});
