import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WindowRef } from '@core/services/window.ref';
import { render, within } from '@testing-library/angular';
import { By } from '@angular/platform-browser';
import { SharedModule } from '@shared/shared.module';

import { Establishment } from '../../../../mockdata/establishment';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { MockUserService } from '@core/test-utils/MockUserService';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { WorkplaceRoutingModule } from '../../workplace/workplace-routing.module';
import { WorkplaceModule } from '../../workplace/workplace.module';
import { StartComponent } from '../../workplace/start/start.component';

import { HomeTabComponent } from './home-tab.component';


describe('HomeTabComponent', () => {
  async function setup() {
    const component = await render(HomeTabComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule.withRoutes(
          [{path: 'workplace/4698f4a4-ab82-4906-8b0e-3f4972375927/start', component: StartComponent}]),
        WorkplaceModule,
        WorkplaceRoutingModule,
        HttpClientTestingModule],
      declarations: [
        HomeTabComponent,
      ],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService]
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(1, true),
          deps: [HttpClient]
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService
        },
      ],
    });

    component.fixture.componentInstance.canEditEstablishment = true;
    component.fixture.componentInstance.workplace = Establishment;
    component.fixture.componentInstance.workplace.employerType = null;
    component.fixture.detectChanges();

    return {
      component
    };
  }

  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show flu jab when can add worker', async () => {
    const { component } = await setup();
    component.fixture.componentInstance.canEditEstablishment = true;
    component.fixture.detectChanges()

    expect(component.getByTestId("flu-jab"))
  });
  it('should not show flu jab when cant add worker', async () => {
    const { component } = await setup();
    component.fixture.componentInstance.canEditEstablishment = false;
    component.fixture.detectChanges()
    expect(component.getByTestId("flu-jab")).toBeNull()
  });
  it('has Add Workplace Information', async () => {
    // Arrange
    const { component } = await setup();

    // Act
    const link = component.getByTestId("add-workplace-info");

    // Assert
    expect(link.innerHTML).toContain("Add workplace information");
  });
});
