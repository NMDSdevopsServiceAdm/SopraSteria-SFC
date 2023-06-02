import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { BenchmarksResponse } from '@core/model/benchmarks.model';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { DataAreaTabComponent } from './data-area-tab.component';

fdescribe('DataAreaTabComponent', () => {
  const setup = async () => {
    const establishment = establishmentBuilder() as Establishment;
    const { fixture, getByRole, getByTestId, getByText, queryByTestId } = await render(DataAreaTabComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: PermissionsService,
          useClass: MockPermissionsService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
      ],
      declarations: [],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        workplace: establishment,
      },
    });

    const component = fixture.componentInstance;
    component.tilesData = {
      meta: {
        workplaces: 0,
        staff: 0,
        localAuthority: 'Oxfordshire',
      },
      careWorkerPay: {
        workplaceValue: {
          value: 889,
          hasValue: true,
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
      },
      seniorCareWorkerPay: {
        workplaceValue: {
          value: 979,
          hasValue: true,
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
      },
      registeredNursePay: {
        workplaceValue: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-pay-data',
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
      },
      registeredManagerPay: {
        workplaceValue: {
          value: 30000,
          hasValue: true,
        },
        comparisonGroup: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
        goodCqc: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-data',
        },
      },
    };

    return {
      component,
      fixture,
      getByRole,
      getByTestId,
      getByText,
      queryByTestId,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show registered nurse salary in comparision group table', async () => {
    const { component, fixture, getByTestId } = await setup();

    component.showRegisteredNurseSalary = true;
    // component.careWorkerPay = 889;
    // component.seniorCareWorkerPay = 1089;
    fixture.detectChanges();

    expect(getByTestId('register-nurse-comparision')).toBeTruthy();
  });

  it('should not show registered nurse salary in comparision group table', async () => {
    const { component, fixture, queryByTestId } = await setup();

    component.showRegisteredNurseSalary = false;
    component.careWorkerPay = 889;
    component.seniorCareWorkerPay = 1089;
    fixture.detectChanges();

    expect(queryByTestId('register-nurse-comparision')).toBeFalsy();
  });

  // xit('should show the care worker hourly pay', async () => {
  //   const { getByText } = await setup();
  //   expect(getByText('£10.26 (hourly)')).toBeTruthy();
  // });

  // xit('should show the comparison group care worker hourly pay', async () => {
  //   const { component, fixture, getByText } = await setup();

  //   component.showRegisteredNurseSalary = false;
  //   component.viewBenchmarksComparisonGroups = false;
  //   fixture.detectChanges();

  //   expect(getByText('£9.75 (hourly)')).toBeTruthy();
  // });
});
