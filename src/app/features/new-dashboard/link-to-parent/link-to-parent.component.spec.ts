import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { fireEvent, getByLabelText, getByTestId, render, within } from '@testing-library/angular';
import { LinkToParentComponent } from './link-to-parent.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { getTestBed } from '@angular/core/testing';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import userEvent from '@testing-library/user-event';

describe('LinkToParentComponent', () => {
  async function setup() {
    const { getByRole, getByText, getByLabelText, getByTestId, fixture } = await render(LinkToParentComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        AlertService,
        WindowRef,
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
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
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
      componentProperties: {},
    });
    const component = fixture.componentInstance;

    const parentRequestsService = TestBed.inject(ParentRequestsService);

    const establishmentService = TestBed.inject(EstablishmentService);

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
      parentRequestsService,
      establishmentService,
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
      name: /link to a parent workplace/i,
    });

    expect(heading).toBeTruthy();
  });

  it('should show the sub heading', async () => {
    const { getByRole } = await setup();

    const heading = getByRole('heading', {
      name: /what's a parent workplace\?/i,
    });

    expect(heading).toBeTruthy();
  });

  it('should show the reveal', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('linkToParentRevealTitle')).toBeTruthy();
    expect(getByTestId('linkToParentRevealText')).toBeTruthy();
  });

  it('should show the link parent request button', async () => {
    const { getByText } = await setup();

    const linkToParentRequestButton = getByText('Send link request');

    expect(linkToParentRequestButton).toBeTruthy();
  });

  it('should show the cancel link with the correct href back to the home tab', async () => {
    const { getByText } = await setup();

    const cancelRequestLink = getByText('Cancel');

    expect(cancelRequestLink).toBeTruthy();
    expect(cancelRequestLink.getAttribute('href')).toEqual('/dashboard');
  });
});
