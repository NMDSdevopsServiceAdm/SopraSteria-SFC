import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { BenchmarksAboutTheDataComponent } from '@shared/components/benchmarks-tab/about-the-data/about-the-data.component';
import { BenchmarksModule } from '@shared/components/benchmarks-tab/benchmarks.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { Establishment as MockEstablishment } from '../../../../../mockdata/establishment';

describe('BenchmarksAboutTheDataComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(BenchmarksAboutTheDataComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, BenchmarksModule, RouterModule],
      declarations: [],
      providers: [
        {
          provide: BenchmarksV2Service,
          useClass: MockBenchmarksService,
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
        { provide: PermissionsService, useClass: MockPermissionsService },
      ],
      componentProperties: {
        workplace: MockEstablishment as Establishment,
      },
    });
    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    return {
      fixture,
      component,
      routerSpy,
      getByText,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    component.meta = { workplaces: 1, staff: 1, localAuthority: 'Test LA' };

    expect(component).toBeTruthy();
  });

  it('should have the right text with only one workplace', async () => {
    const { component, fixture } = await setup();
    component.meta = { workplaces: 1, staff: 1, localAuthority: 'Test LA' };
    fixture.detectChanges();

    const componenttext = await within(document.body).findByTestId('meta-data');
    expect(componenttext.innerHTML).toContain(
      `is 1 staff from 1 workplace providing the same main service as you in your local authority`,
    );
  });

  it('should have the right text with correct comma placement', async () => {
    const { component, fixture } = await setup();
    component.meta = { workplaces: 1000, staff: 1000, localAuthority: 'Test LA' };
    fixture.detectChanges();

    const componenttext = await within(document.body).findByTestId('meta-data');
    expect(componenttext.innerHTML).toContain(
      `is 1,000 staff from 1,000 workplaces providing the same main service as you in your local authority`,
    );
  });

  it('should have the right text with no data', async () => {
    const { component, fixture } = await setup();
    component.meta = null;
    fixture.detectChanges();

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
