import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { render } from '@testing-library/angular';

import { BulkUploadRelatedContentComponent } from '../bulk-upload-sidebar/bulk-upload-related-content/bulk-upload-related-content.component';
import { CodesAndGuidanceComponent } from '../codes-and-guidance/codes-and-guidance.component';
import { BulkUploadHelpMainPageComponent } from './bulk-upload-help-main-page.component';

describe('BulkUploadHelpMainPage', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(BulkUploadHelpMainPageComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        { provide: AuthService, useClass: MockAuthService },
      ],
      declarations: [BulkUploadHelpMainPageComponent, BulkUploadRelatedContentComponent, CodesAndGuidanceComponent],
    });
    const component = fixture.componentInstance;

    return { component, getByText };
  };

  it('should render a StartPageComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the page heading, and sub section headings', async () => {
    const { getByText } = await setup();

    expect(getByText('Get help with bulk uploads')).toBeTruthy();
    expect(getByText(`Top tips and 'how to' guides`)).toBeTruthy();
    expect(getByText('Troubleshooting')).toBeTruthy();
    expect(getByText('Contact us')).toBeTruthy();
  });

  it('should render the step by step link with the correct href attribute', async () => {
    const { getByText } = await setup();
    const link = getByText('Step by step bulk upload guide');
    expect(link.getAttribute('href')).toBe('/step-by-step-guide');
  });

  it('should render the troubleshooting link with the correct href attribute', async () => {
    const { getByText } = await setup();
    const link = getByText('Get handy troubleshooting hints to help you fix common problems and errors');
    expect(link.getAttribute('href')).toBe('/troubleshooting');
  });

  it('should render related contents and download codes and guidance links', async () => {
    const { getByText } = await setup();
    expect(getByText('Related content')).toBeTruthy();
    expect(getByText('Download codes and guidance')).toBeTruthy();
  });

  it('should render the Data changes and About bulk upload links under the related contents', async () => {
    const { getByText } = await setup();
    expect(getByText('Data changes')).toBeTruthy();
    expect(getByText('About bulk upload')).toBeTruthy();
  });
});
