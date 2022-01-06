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
import { AboutBulkUploadComponent } from './about-bulk-upload.component';

describe('AboutBulkUploadComponent', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(AboutBulkUploadComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        { provide: AuthService, useClass: MockAuthService },
      ],
      declarations: [AboutBulkUploadComponent, BulkUploadRelatedContentComponent, CodesAndGuidanceComponent],
    });
    const component = fixture.componentInstance;

    return { component, getByText };
  };

  it('should render a AboutBulkUploadComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the page heading, and sub section headings', async () => {
    const { getByText } = await setup();

    expect(getByText('About bulk upload')).toBeTruthy();
    expect(getByText(`Who should do bulk uploads?`)).toBeTruthy();
    expect(getByText('What you need to know about bulk uploads')).toBeTruthy();
  });

  it('should render related contents and download codes and guidance links', async () => {
    const { getByText } = await setup();
    expect(getByText('Related content')).toBeTruthy();
    expect(getByText('Download codes and guidance')).toBeTruthy();
  });

  it('should render get help with bulk uploads and data changes links under the related contents', async () => {
    const { getByText } = await setup();
    expect(getByText('Get help with bulk uploads')).toBeTruthy();
    expect(getByText('Data changes')).toBeTruthy();
  });
});
