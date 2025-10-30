import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Meta } from '@core/model/benchmarks.model';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { NewComparisonGroupHeaderComponent } from './comparison-group-header.component';

describe('NewComparisonGroupHeaderComponent', () => {
  const setup = async (metaData = {}, canViewFullContent = true) => {
    const meta = metaData ? metaData : null;
    const { fixture, getByText, getByTestId } = await render(NewComparisonGroupHeaderComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule],
      providers: [
        {
          provide: BenchmarksV2Service,
          useClass: MockBenchmarksService,
        },
      provideHttpClient(), provideHttpClientTesting(),],
      componentProperties: {
        meta: meta as Meta,
        workplaceID: 'mock-uid',
        canViewFullContent,
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

  describe('can view full benchmarks content', () => {
    it('should render the comparison group text if there is a comparison group with the correct test if only one workplace', async () => {
      const { getByTestId } = await setup({ workplaces: 1, staff: 1 });

      const componentText = getByTestId('comparison-group-text');
      expect(componentText.innerHTML).toContain(
        `<b>Your comparison group</b> is 1 staff from 1 workplace using ASC-WDS and providing the same main service as you in your local authority.`,
      );
    });

    it('should have the right text with correct comma placement', async () => {
      const { getByTestId } = await setup({ workplaces: 1000, staff: 1000 });

      const componentText = getByTestId('comparison-group-text');
      expect(componentText.innerHTML).toContain(
        `<b>Your comparison group</b> is 1,000 staff from 1,000 workplaces using ASC-WDS and providing the same main service as you in your local authority.`,
      );
    });
  });

  describe('cannot view full benchmarks content', () => {
    it('should render the comparison group text if there is a comparison group with the correct test if only one workplace', async () => {
      const { getByTestId } = await setup({ workplaces: 1, staff: 1 }, false);

      const componentText = getByTestId('comparison-group-text');
      expect(componentText.innerHTML).toContain(
        `<b>Your comparison group</b> is 1 staff from 1 workplace using ASC-WDS and providing adult social care in your local authority.`,
      );
    });

    it('should have the right text with correct comma placement', async () => {
      const { getByTestId } = await setup({ workplaces: 1000, staff: 1000 }, false);

      const componentText = getByTestId('comparison-group-text');
      expect(componentText.innerHTML).toContain(
        `<b>Your comparison group</b> is 1,000 staff from 1,000 workplaces using ASC-WDS and providing adult social care in your local authority.`,
      );
    });
  });

  describe('no comparison group', () => {
    it('should have the right text with no data', async () => {
      const { getByTestId } = await setup();

      const componentText = getByTestId('no-comparison-group-text');
      expect(componentText.innerHTML).toContain(
        `<b>Your comparison group</b> information is not available at the moment.`,
      );
    });
  });

  it('should show the about the data link with href', async () => {
    const { component, getByText } = await setup();

    const setReturnSpy = spyOn(component, 'setReturn');
    const link = getByText('About the data');

    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplaceID}/benchmarks/about-the-data`);

    fireEvent.click(link);
    expect(setReturnSpy).toHaveBeenCalled();
  });

  it('should show the download link that emits event when clicked', async () => {
    const { component, getByTestId } = await setup();

    const downloadAsPDFSpy = spyOn(component, 'downloadAsPDF').and.callThrough();
    const emitSpy = spyOn(component.downloadPDF, 'emit');
    const link = getByTestId('download-link');

    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toEqual('/benchmarks.pdf');

    fireEvent.click(link);
    expect(downloadAsPDFSpy).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalled();
  });
});