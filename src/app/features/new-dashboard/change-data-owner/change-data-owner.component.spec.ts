import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { fireEvent, render } from '@testing-library/angular';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { Establishment } from '../../../../mockdata/establishment';
import { SharedModule } from '@shared/shared.module';
import { getTestBed } from '@angular/core/testing';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { ChangeDataOwnerComponent } from './change-data-owner.component';

describe('ChangeDataOwnerComponent', () => {
  async function setup() {
    const { getAllByText, getByRole, getByText, getByLabelText, getByTestId, fixture, queryByText } = await render(
      ChangeDataOwnerComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        declarations: [],
        providers: [
          AlertService,
          WindowRef,
          UntypedFormBuilder,
          ErrorSummaryService,
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
        ],
        componentProperties: {
          workplace: Establishment,
        },
      },
    );
    const component = fixture.componentInstance;

    const parentRequestsService = TestBed.inject(ParentRequestsService);

    const establishmentService = TestBed.inject(EstablishmentService);

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    return {
      getAllByText,
      getByRole,
      getByText,
      getByLabelText,
      getByTestId,
      queryByText,
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
    const { component, getByTestId } = await setup();

    const mainHeadingTestId = getByTestId('mainHeading');
    const workplaceName = component.workplace.name;

    expect(mainHeadingTestId.textContent).toContain(workplaceName);
  });

  it('should show the main heading', async () => {
    const { getByRole } = await setup();

    const mainHeadingText = getByRole('heading', {
      name: /change data owner/i,
    });
    expect(mainHeadingText).toBeTruthy();
  });

  it('should show the main heading', async () => {
    const { component, getByRole } = await setup();

    const secondaryHeadingText = getByRole('heading', {
      name: /data permissions/i,
    });
    expect(secondaryHeadingText).toBeTruthy();
  });

  it('should show the send change request button', async () => {
    const { component, getByRole } = await setup();

    const button = getByRole('button', {
      name: /send change request/i,
    });

    expect(button).toBeTruthy();
  });

  it('should show the cancel link with the correct href back to the home tab', async () => {
    const { getByRole } = await setup();

    const cancelLink = getByRole('link', {
      name: /cancel/i,
    });

    expect(cancelLink).toBeTruthy();
    expect(cancelLink.getAttribute('href')).toEqual('/dashboard');
  });

  it('should show error message when nothing is submitted', async () => {
    const { component, fixture, getByText, getAllByText } = await setup();

    const sendChangeRequestButton = getByText('Send change request');

    const dataPermissionErrorMessage = 'Select which data permission you want them to have';
    const form = component.form;

    fireEvent.click(sendChangeRequestButton);
    fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(getAllByText(dataPermissionErrorMessage).length).toEqual(2);
  });
});
