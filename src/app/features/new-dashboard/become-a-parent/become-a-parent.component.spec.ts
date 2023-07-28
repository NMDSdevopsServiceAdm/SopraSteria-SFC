import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { BenchmarksService } from '@core/services/benchmarks.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { render } from '@testing-library/angular';

import { BecomeAParentComponent } from './become-a-parent.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { getTestBed } from '@angular/core/testing';

fdescribe('BecomeAParentComponent', () => {
  async function setup() {
    const { getByRole, getByText, getByLabelText, getByTestId, fixture } = await render(BecomeAParentComponent, {
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
      getByRole,
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
    const { component, getByText } = await setup();
    const workplaceName = component.workplace.name;

    expect(getByText(workplaceName)).toBeTruthy();
  });

  it('should show the heading', async () => {
    const { getByRole } = await setup();

    const heading = getByRole('heading', {
      name: /become a parent and manage other workplaces' data/i,
    });

    expect(heading).toBeTruthy();
  });
});
