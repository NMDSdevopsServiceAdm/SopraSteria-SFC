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
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { BulkUploadRelatedContentComponent } from '../bulk-upload-sidebar/bulk-upload-related-content/bulk-upload-related-content.component';
import { CodesAndGuidanceComponent } from '../codes-and-guidance/codes-and-guidance.component';
import { BulkUploadFlowchartComponent } from './bulk-upload-flowchart/bulk-upload-flowchart.component';
import { BulkUploadHelpMainPageComponent } from './bulk-upload-help-main-page.component';
import { BulkUploadTopTipPageComponent } from './bulk-upload-top-tip-page/bulk-upload-top-tip-page.component';

describe('BulkUploadHelpMainPageComponent', () => {
  const topTipsList = MockBulkUploadTopTipsService.topTipsListFactory();

  const setup = async () => {
    const { fixture, getByText } = await render(BulkUploadHelpMainPageComponent, {
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'bulk-upload/get-help/step-by-step-guide', component: BulkUploadFlowchartComponent },
          { path: 'bulk-upload/get-help/top-tip-one', component: BulkUploadTopTipPageComponent },
          { path: 'bulk-upload/get-help/top-tip-two', component: BulkUploadTopTipPageComponent },
          { path: 'bulk-upload/get-help/top-tip-three', component: BulkUploadTopTipPageComponent },
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
              },
            },
          }),
        },
      ],
      declarations: [BulkUploadHelpMainPageComponent, BulkUploadRelatedContentComponent, CodesAndGuidanceComponent],
    });

    const bulkUploadToptTipsService = getTestBed().inject(BulkUploadTopTipsService) as BulkUploadTopTipsService;
    const spy = spyOn(bulkUploadToptTipsService, 'setReturnTo');

    const component = fixture.componentInstance;

    return { component, fixture, getByText, spy };
  };

  it('should render a BulkUploadHelpMainPageComponent', async () => {
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
    expect(link.getAttribute('href')).toContain('step-by-step-guide');
  });

  it('should render the troubleshooting link with the correct href attribute', async () => {
    const { getByText } = await setup();
    const link = getByText('Get handy troubleshooting hints to help you fix common problems and errors');
    expect(link.getAttribute('href')).toContain('troubleshooting');
  });

  it('should render the CMS top tip links with the correct href attribute', async () => {
    const { getByText } = await setup();
    const firstTopTipLink = getByText(topTipsList.data[0].title);
    const secondTopTipLink = getByText(topTipsList.data[1].title);
    const thirdTopTipLink = getByText(topTipsList.data[2].title);

    expect(firstTopTipLink.getAttribute('href')).toContain(topTipsList.data[0].slug);
    expect(secondTopTipLink.getAttribute('href')).toContain(topTipsList.data[1].slug);
    expect(thirdTopTipLink.getAttribute('href')).toContain(topTipsList.data[2].slug);
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

  it('should call the setReturnUrl function with no slug when clicking top tip link not brought in by cms', async () => {
    const { component, fixture, getByText, spy } = await setup();

    component.currentUrl = 'bulk-upload/get-help';
    fixture.detectChanges();

    const flowchartLink = getByText('Step by step bulk upload guide');
    fireEvent.click(flowchartLink);

    expect(spy).toHaveBeenCalledWith({ url: ['bulk-upload/get-help'] });
  });

  it('should call the setReturnUrl function with correct slug when clicking the first cms link', async () => {
    const { component, fixture, getByText, spy } = await setup();

    component.currentUrl = 'bulk-upload/get-help';
    fixture.detectChanges();

    const firstTopTipLink = getByText(topTipsList.data[0].title);
    fireEvent.click(firstTopTipLink);

    expect(spy).toHaveBeenCalledWith({ url: [`bulk-upload/get-help/${topTipsList.data[0].slug}`] });
  });

  it('should call the setReturnUrl function with correct slug when clicking the second cms link', async () => {
    const { component, fixture, getByText, spy } = await setup();

    component.currentUrl = 'bulk-upload/get-help';
    fixture.detectChanges();

    const firstTopTipLink = getByText(topTipsList.data[1].title);
    fireEvent.click(firstTopTipLink);

    expect(spy).toHaveBeenCalledWith({ url: [`bulk-upload/get-help/${topTipsList.data[1].slug}`] });
  });

  it('hould call the setReturnUrl function with correct slug when clicking the third cms link', async () => {
    const { component, fixture, getByText, spy } = await setup();

    component.currentUrl = 'bulk-upload/get-help';
    fixture.detectChanges();

    const firstTopTipLink = getByText(topTipsList.data[2].title);
    fireEvent.click(firstTopTipLink);

    expect(spy).toHaveBeenCalledWith({ url: [`bulk-upload/get-help/${topTipsList.data[2].slug}`] });
  });
});
