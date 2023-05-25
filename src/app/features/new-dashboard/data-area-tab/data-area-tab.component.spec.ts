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
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { DataAreaTabComponent } from './data-area-tab.component';

describe('DataAreaTabComponent', () => {
  const setup = async () => {
    const establishment = establishmentBuilder() as Establishment;
    const { fixture, getByTestId, queryByTestId } = await render(DataAreaTabComponent, {
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
      getByTestId,
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
});
