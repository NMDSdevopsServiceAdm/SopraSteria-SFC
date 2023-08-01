import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ParentRequestsService } from '@core/services/parent-requests.service';
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
import { AlertService } from '@core/services/alert.service';

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

    const parentsRequestService = TestBed.inject(ParentRequestsService);
    //const alertService = TestBed.inject(AlertService)

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
      parentsRequestService,
      //alertService
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

  it('should show the sub heading', async () => {
    const { getByRole } = await setup();

    const heading = getByRole('heading', {
      name: /what's a parent workplace\?/i,
    });

    expect(heading).toBeTruthy();
  });

  it('should show the reveal', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('becomeAParentRevealTitle')).toBeTruthy();
    expect(getByTestId('becomeAParentRevealText')).toBeTruthy();
  });

  it('should show the link with the correct href', async () => {
    const { getByText } = await setup();
    const link = getByText('Contact us');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toEqual('/contact-us');
  });

  it('should show the parent request button ', async () => {
    const { getByText } = await setup();

    const parentRequestButton = getByText('Send parent request');

    expect(parentRequestButton).toBeTruthy();
  });

  it('should show the cancel link with the correct href back to the home tab', async () => {
    const { getByText } = await setup();

    const cancelRequestLink = getByText('Cancel');

    expect(cancelRequestLink).toBeTruthy();
    expect(cancelRequestLink.getAttribute('href')).toEqual('/dashboard');
  });
});
