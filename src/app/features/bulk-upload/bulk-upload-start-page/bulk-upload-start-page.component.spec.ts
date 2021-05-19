import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { render } from '@testing-library/angular';

import { AdminSkipService } from '../admin-skip.service';
import { CodesAndGuidanceComponent } from '../codes-and-guidance/codes-and-guidance.component';
import { BulkUploadStartPageComponent } from './bulk-upload-start-page.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';

describe('BulkUploadStartPage', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(BulkUploadStartPageComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule],
      providers: [{ provide: BreadcrumbService, useClass: MockBreadcrumbService },{ provide: FeatureFlagsService, useClass: MockFeatureFlagsService }, AdminSkipService],
      declarations: [BulkUploadStartPageComponent, CodesAndGuidanceComponent],
    });
    const component = fixture.componentInstance;

    return { component, getByText };
  };

  it('should render a StartPageComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should navigate to workplace references page when Continue button is clicked', async () => {
    const { getByText } = await setup();
    const continueButton = getByText('Continue');
    expect(continueButton.getAttribute('href')).toBe('/bulk-upload/missing-workplace-references');
  });

  it('should return to home page(dashboard) when Cancel link is clicked', async () => {
    const { getByText } = await setup();
    const cancelButton = getByText('Cancel');
    expect(cancelButton.getAttribute('href')).toBe('/dashboard');
  });
});
