import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadTopTipsService } from '@core/services/bulk-upload/bulk-upload-top-tips.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockBulkUploadTopTipsService } from '@core/test-utils/MockBulkUploadTopTipsService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { BulkUploadRelatedContentComponent } from '@features/bulk-upload/bulk-upload-sidebar/bulk-upload-related-content/bulk-upload-related-content.component';
import { CodesAndGuidanceComponent } from '@features/bulk-upload/codes-and-guidance/codes-and-guidance.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { BulkUploadTopTipPageComponent } from './bulk-upload-top-tip-page.component';

describe('BulkUploadTopTipPageComponent', () => {
  const topTipsList = MockBulkUploadTopTipsService.topTipsListFactory();
  const topTip = MockBulkUploadTopTipsService.topTipFactory();

  const setup = async () => {
    const { fixture, getByText } = await render(BulkUploadTopTipPageComponent, {
      imports: [
        RouterTestingModule.withRoutes([
          { path: `bulk-upload/get-help/${topTipsList.data[0].slug}`, component: BulkUploadTopTipPageComponent },
          { path: `bulk-upload/get-help/${topTipsList.data[0].slug}`, component: BulkUploadTopTipPageComponent },
          { path: `bulk-upload/get-help/${topTipsList.data[0].slug}`, component: BulkUploadTopTipPageComponent },
        ]),
        HttpClientTestingModule,
        BrowserModule,
      ],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        { provide: AuthService, useClass: MockAuthService },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            params: [],
            url: of(['testUrl']),
            snapshot: {
              data: {
                topTipsList,
                topTip,
              },
            },
          }),
        },
      ],
      declarations: [BulkUploadTopTipPageComponent, BulkUploadRelatedContentComponent, CodesAndGuidanceComponent],
    });

    const bulkUploadToptTipsService = getTestBed().inject(BulkUploadTopTipsService) as BulkUploadTopTipsService;
    const spy = spyOn(bulkUploadToptTipsService, 'setReturnTo');

    const component = fixture.componentInstance;

    return { component, fixture, getByText, spy };
  };

  it('should render a BulkUploadTopTipPageComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Main content', () => {
    it('should display the title of the top tip', async () => {
      const { getByText } = await setup();
      expect(getByText(topTip.data[0].title)).toBeTruthy();
    });

    it('should display the top tip content', async () => {
      const { getByText } = await setup();
      expect(getByText(topTip.data[0].content)).toBeTruthy();
    });
  });

  describe('How to guides links', () => {
    it('should display the link titles for the how to guides', async () => {
      const { getByText } = await setup();
      expect(getByText('Step by step bulk upload guide')).toBeTruthy();
      expect(getByText(topTipsList.data[0].link_title)).toBeTruthy();
      expect(getByText(topTipsList.data[1].link_title)).toBeTruthy();
      expect(getByText(topTipsList.data[2].link_title)).toBeTruthy();
    });

    it('should have the correct hrefs in the links', async () => {
      const { getByText } = await setup();
      expect(getByText('Step by step bulk upload guide').getAttribute('href')).toContain('step-by-step-guide');
      expect(getByText(topTipsList.data[0].link_title).getAttribute('href')).toContain(topTipsList.data[0].slug);
      expect(getByText(topTipsList.data[1].link_title).getAttribute('href')).toContain(topTipsList.data[1].slug);
      expect(getByText(topTipsList.data[2].link_title).getAttribute('href')).toContain(topTipsList.data[2].slug);
    });

    it('should show the current top tip link in bold, but not the others', async () => {
      const { getByText } = await setup();

      const firstTopTipLink = getByText(topTipsList.data[0].link_title).closest('li');
      const secondTopTipLink = getByText(topTipsList.data[1].link_title).closest('li');
      const thirdTopTipLink = getByText(topTipsList.data[2].link_title).closest('li');

      expect(firstTopTipLink.classList).toContain('govuk-!-font-weight-bold');
      expect(secondTopTipLink.classList).not.toContain('govuk-!-font-weight-bold');
      expect(thirdTopTipLink.classList).not.toContain('govuk-!-font-weight-bold');
    });

    it('should call the setReturnUrl function with correct slug when clicking the first cms link', async () => {
      const { getByText, spy } = await setup();

      const firstTopTipLink = getByText(topTipsList.data[0].link_title);
      fireEvent.click(firstTopTipLink);

      expect(spy).toHaveBeenCalledWith({ url: ['/bulk-upload', 'get-help', topTipsList.data[0].slug] });
    });

    it('hould call the setReturnUrl function with correct slug when clicking the second cms link', async () => {
      const { getByText, spy } = await setup();

      const firstTopTipLink = getByText(topTipsList.data[1].link_title);
      fireEvent.click(firstTopTipLink);

      expect(spy).toHaveBeenCalledWith({ url: ['/bulk-upload', 'get-help', topTipsList.data[1].slug] });
    });

    it('hould call the setReturnUrl function with correct slug when clicking the third cms link', async () => {
      const { getByText, spy } = await setup();

      const firstTopTipLink = getByText(topTipsList.data[2].link_title);
      fireEvent.click(firstTopTipLink);

      expect(spy).toHaveBeenCalledWith({ url: ['/bulk-upload', 'get-help', topTipsList.data[2].slug] });
    });
  });

  describe('Other links', () => {
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
});
