import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
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
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { DataAreaTabComponent } from './data-area-tab.component';
import userEvent from '@testing-library/user-event';

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
    fixture.detectChanges();

    expect(getByTestId('register-nurse-comparision')).toBeTruthy();
  });

  it('should not show registered nurse salary in comparision group table', async () => {
    const { component, fixture, queryByTestId } = await setup();

    component.showRegisteredNurseSalary = false;
    fixture.detectChanges();

    expect(queryByTestId('register-nurse-comparision')).toBeFalsy();
  });

  it('should show the care worker hourly pay', async () => {
    const { getByText } = await setup();
    expect(getByText('£10.26 (hourly)')).toBeTruthy();
  });

  it('should show the comparison group care worker hourly pay', async () => {
    const { component, fixture, getByText } = await setup();

    component.showRegisteredNurseSalary = false;
    component.viewBenchmarksComparisonGroups = false;
    fixture.detectChanges();

    expect(getByText('£9.75 (hourly)')).toBeTruthy();
  });

  // xit('should show the comparison group care worker hourly pay when select has changed - temp test', async () => {
  //   const { component, fixture, getByRole, getByText } = await setup();

  //   component.viewBenchmarksComparisonGroups = true;

  //   const goodAndOutstandingInput = getByRole('radio', { name: 'comparison-groups-good-and-outstanding' });
  //   fireEvent.change(goodAndOutstandingInput);

  //   fixture.detectChanges();

  //   expect(getByText('£9.96 (hourly)')).toBeTruthy();
  // });
});
