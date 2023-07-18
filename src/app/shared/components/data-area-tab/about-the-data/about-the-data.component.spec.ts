import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { BenchmarksService } from '@core/services/benchmarks.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { fireEvent, render } from '@testing-library/angular';

import { DataAreaAboutTheDataComponent } from './about-the-data.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { getTestBed } from '@angular/core/testing';

describe('DataAreaAboutTheDataComponent', () => {
  async function setup() {
    const { getByText, getByLabelText, getByTestId, fixture } = await render(DataAreaAboutTheDataComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        { provide: BenchmarksService, useClass: MockBenchmarksService },
        { provide: PermissionsService, useClass: MockPermissionsService },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },

        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
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
      ],
    });
    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    return {
      getByText,
      getByLabelText,
      getByTestId,
      fixture,
      component,
      routerSpy,
    };
  }
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the workplace name', async () => {
    const { component } = await setup();
    const workplaceName = component.workplace.name;
    expect(workplaceName).toBeTruthy();
  });

  it('should show the About the data header', async () => {
    const { getByText } = await setup();

    const aboutData = getByText('About the data');
    expect(aboutData).toBeTruthy();
  });

  it('should navigate to the benchmarks page', async () => {
    const { component, getByText, routerSpy, fixture } = await setup();

    const returnButton = getByText('Return to benchmarks');

    fireEvent.click(returnButton);

    fixture.detectChanges();
    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'benchmarks' });
  });
});
