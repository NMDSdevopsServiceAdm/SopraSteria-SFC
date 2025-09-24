import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackLinkService } from '@core/services/backLink.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { BulkUploadFlowchartComponent } from './bulk-upload-flowchart.component';

describe('BulkUploadFlowchartComponent', () => {
  async function setup() {
    const backLinkServiceSpy = jasmine.createSpyObj('BacklinkService', ['showBackLink']);

    const setupTools = await render(BulkUploadFlowchartComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule],
      providers: [
        {
          provide: BackLinkService,
          useValue: backLinkServiceSpy,
        },
      provideHttpClient(), provideHttpClientTesting(),],
    });

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      backLinkServiceSpy,
    };
  }
  it('should render a BulkUploadPageComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the title and the flowchart', async () => {
    const { getByTestId } = await setup();

    const heading = getByTestId('heading');
    expect(heading).toBeTruthy();
  });

  it('should show a download link', async () => {
    const { getByText } = await setup();

    const downloadLink = getByText('Download step by step guide (PDF, 108KB)');
    expect(downloadLink).toBeTruthy();
  });

  it('should set the back link', async () => {
    const { backLinkServiceSpy } = await setup();

    expect(backLinkServiceSpy.showBackLink).toHaveBeenCalled();
  });
});