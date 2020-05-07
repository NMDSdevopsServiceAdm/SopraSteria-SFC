import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { render, within, prettyDOM } from '@testing-library/angular';
import { HomeTabComponent } from '@features/dashboard/home-tab/home-tab.component';
import { SharedModule } from '@shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { WindowRef } from '@core/services/window.ref';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockNotificationsService } from '@core/test-utils/MockNotificationsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { HttpClient } from '@angular/common/http';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { PermissionType } from '@core/model/permissions.model';
import { getTestBed, TestBed } from '@angular/core/testing';

describe('DashboardComponent', () => {
  async function setup(isAdmin: boolean = true) {
    const permissions: PermissionType[] = isAdmin ? ['canDeleteEstablishment'] : [];

    const component =  await render(DashboardComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      declarations: [
        HomeTabComponent
      ],
      providers: [
        {
          provide: WindowRef
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions),
          deps: [HttpClient, Router, UserService]
        },
        {
          provide: UserService,
          useClass: MockUserService
        },
        {
          provide: NotificationsService,
          useClass: MockNotificationsService
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService
        }
      ]
    });

    const injector = getTestBed();
    const establishmentService = injector.get(EstablishmentService) as EstablishmentService;

    return {
      component,
      establishmentService
    }
  }

  it('should render a DashboardComponent', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  describe("Archive Workplace", () => {
    it('should display a Delete Workplace link if user is an admin', async () => {
      const { component } = await setup(true);

      component.getByText('Delete Workplace');
    });

    it('should not display a Delete Workplace link if user not an admin', async () => {
      const { component } = await setup(false);

      expect(component.queryByText('Delete Workplace')).toBeNull();
    });

    it('should display a modal when the user clicks on Delete Workplace', async () => {
      const { component } = await setup(true);

      const deleteWorkplace = component.getByText('Delete Workplace');
      deleteWorkplace.click();

      await within(document.body).findByRole('dialog');
    });

    it('should send a DELETE request once the user confirms to Delete Workplace', async () => {
      const { component, establishmentService } = await setup(true);

      const deleteWorkplace = component.getByText('Delete Workplace');
      deleteWorkplace.click();

      const dialog = await within(document.body).findByRole('dialog');
      console.log(prettyDOM(dialog))
      const confirm = within(dialog).getByText('Delete workplace')
      console.log(prettyDOM(confirm))
      confirm.click();

      const spy = spyOn(establishmentService, 'deleteWorkplace');

      expect(spy).toHaveBeenCalled();
    });
  });
});

