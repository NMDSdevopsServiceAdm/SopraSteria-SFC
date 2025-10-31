import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { BenchmarksAboutTheDataComponent } from '@shared/components/benchmarks-tab/about-the-data/about-the-data.component';
import { BenchmarksModule } from '@shared/components/benchmarks-tab/benchmarks.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { Establishment as MockEstablishment } from '../../../../../mockdata/establishment';

describe('BenchmarksAboutTheDataComponent', () => {
  async function setup(overrides: any = {}) {
    const setupTools = await render(BenchmarksAboutTheDataComponent, {
      imports: [BrowserModule, BenchmarksModule, RouterModule],
      declarations: [],
      providers: [
        {
          provide: BenchmarksV2Service,
          useValue: {
            benchmarksData: {
              oldBenchmarks: {
                meta: overrides.meta ?? {},
              },
            },
          },
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              url: [{ path: 1 }, { path: 2 }],
              params: {
                establishmentID: 123,
              },
            },
          },
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(overrides.permissions ?? ['canViewBenchmarks']),
        },
      provideHttpClient(), provideHttpClientTesting(),],
      componentProperties: {
        workplace: MockEstablishment as Establishment,
      },
    });
    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    return {
      ...setupTools,
      component,
      routerSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup({
      meta: { workplaces: 1, staff: 1, localAuthority: 'Test LA' },
    });

    expect(component).toBeTruthy();
  });

  it('should display the extra comparison bullet point with the right text when only one workplace', async () => {
    await setup({
      meta: { workplaces: 1, staff: 1, localAuthority: 'Test LA' },
    });

    const componenttext = await within(document.body).findByTestId('meta-data');
    expect(componenttext.innerHTML).toContain(
      'is 1 staff from 1 workplace providing the same main service as you in your local authority',
    );
  });

  it('should display the extra comparison bullet point with correct comma placement when metadata', async () => {
    await setup({
      meta: { workplaces: 1000, staff: 1000, localAuthority: 'Test LA' },
    });

    const componenttext = await within(document.body).findByTestId('meta-data');
    expect(componenttext.innerHTML).toContain(
      'is 1,000 staff from 1,000 workplaces providing the same main service as you in your local authority',
    );
  });

  it('should not display the extra comparison bullet point if no metadata in benchmarks service', async () => {
    const { fixture } = await setup({ meta: {} });

    const lineItemCount = fixture.debugElement.queryAll(By.css('li')).length;
    expect(lineItemCount).toBe(2);
  });

  it('should not display the extra comparison bullet point if workplace does not have view benchmarks permission', async () => {
    const { fixture } = await setup({
      meta: { workplaces: 1000, staff: 1000, localAuthority: 'Test LA' },
      permissions: [],
    });

    const lineItemCount = fixture.debugElement.queryAll(By.css('li')).length;
    expect(lineItemCount).toBe(2);
  });

  it('should navigate to the benchmarks page when you click View your benchmarks button', async () => {
    const { getByText, routerSpy, fixture } = await setup();

    const viewBenchmarksButton = getByText('View your benchmarks');

    fireEvent.click(viewBenchmarksButton);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'benchmarks' });
  });
});