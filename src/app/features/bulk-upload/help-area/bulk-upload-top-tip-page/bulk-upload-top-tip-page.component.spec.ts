import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { BulkUploadRelatedContentComponent } from '@features/bulk-upload/bulk-upload-sidebar/bulk-upload-related-content/bulk-upload-related-content.component';
import { CodesAndGuidanceComponent } from '@features/bulk-upload/codes-and-guidance/codes-and-guidance.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { render } from '@testing-library/angular';

import { BulkUploadTopTipPageComponent } from './bulk-upload-top-tip-page.component';

fdescribe('BulkUploadTopTipPageComponent', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(BulkUploadTopTipPageComponent, {
      imports: [RouterTestingModule.withRoutes([]), HttpClientTestingModule, BrowserModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        { provide: AuthService, useClass: MockAuthService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                topTipsList: {
                  data: [
                    { title: 'Add unique references', slug: 'add-unique-references' },
                    { title: 'Update records', slug: 'update-records' },
                    { title: 'Validate files', slug: 'validate-files' },
                  ],
                },
              },
            },
          },
        },
      ],
      declarations: [BulkUploadTopTipPageComponent, BulkUploadRelatedContentComponent, CodesAndGuidanceComponent],
    });
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);

    return { component, getByText, router };
  };

  it('should render a BulkUploadTopTipPageComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
