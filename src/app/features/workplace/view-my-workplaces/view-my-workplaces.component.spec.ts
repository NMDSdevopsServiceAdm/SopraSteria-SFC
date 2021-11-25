import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WorkplaceInfoPanelComponent } from '../workplace-info-panel/workplace-info-panel.component';
import { ViewMyWorkplacesComponent } from './view-my-workplaces.component';

describe('ViewMyWorkplacesComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId, queryByText } = await render(ViewMyWorkplacesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [WorkplaceInfoPanelComponent],
      providers: [
        AlertService,
        WindowRef,
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canAddEstablishment']),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
        {
          provide: UserService,
          useClass: MockUserService,
          deps: [HttpClient],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
      ],
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const permissionsService = injector.inject(PermissionsService) as PermissionsService;

    return {
      component,
      fixture,
      permissionsService,
      getByText,
      getByTestId,
      queryByText,
    };
  }

  it('should render a ViewMyWorkplacesComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display approved workplace (ustatus set to null)', async () => {
    const { getByText } = await setup();
    expect(getByText('First Subsid Workplace')).toBeTruthy();
  });

  it('should display pending workplace message for workplaces with ustatus set to PENDING', async () => {
    const { queryByText } = await setup();
    expect(
      queryByText('Your application for Another Subsid Workplace is being reviewed by Skills for Care.'),
    ).toBeTruthy();
  });

  it('should display pending workplace message for workplaces with ustatus set to IN PROGRESS', async () => {
    const { queryByText } = await setup();
    expect(queryByText('Your application for Third Subsid is being reviewed by Skills for Care.')).toBeTruthy();
  });
});
