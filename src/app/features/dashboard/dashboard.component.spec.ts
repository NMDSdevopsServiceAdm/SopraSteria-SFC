import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockNotificationsService } from '@core/test-utils/MockNotificationsService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { HomeTabComponent } from '@features/dashboard/home-tab/home-tab.component';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  async function setup(isAdmin = true, subsidiaries = 0) {
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
          useFactory: MockUserService.factory(subsidiaries, isAdmin),
          deps: [HttpClient]
        },
        {
          provide: NotificationsService,
          useClass: MockNotificationsService
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService
        },
        {
          provide: AuthService,
          useClass: MockAuthService
        }
      ]
    });

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router) as Router;

    return {
      component,
      establishmentService,
      router
    };
  }

  it('should render a DashboardComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Tabs', () => {
    it('should display the Benchmarks tab when the workplace is CQC Regulated', async () => {
      const { component } = await setup(true);

      const establishment = {
        ...component.fixture.componentInstance.workplace
      };
      establishment.isRegulated = true;
      component.fixture.componentInstance.workplace = establishment;
      component.fixture.detectChanges();

      expect(component.getByText('Benchmarks')).toBeTruthy();
    });
    it('should display the Benchmarks tab when the workplace is not CQC Regulated', async () => {
      const { component } = await setup(true);

      const establishment = {
        ...component.fixture.componentInstance.workplace
      };
      establishment.isRegulated = false;
      component.fixture.componentInstance.workplace = establishment;
      component.fixture.detectChanges();

      expect(component.queryByText('Benchmarks')).toBeNull();
    });
    it('should display the Users tab', async () => {
      const { component } = await setup(true);

      const establishment = {
        ...component.fixture.componentInstance.workplace
      };
      establishment.isRegulated = false;
      component.fixture.componentInstance.workplace = establishment;
      component.fixture.detectChanges();

      expect(component.getByText('Users')).toBeTruthy();
    });
  });

  describe('Archive Workplace', () => {
    it('should display a Delete Workplace link if user is an admin', async () => {
      const { component } = await setup(true);

      component.getByText('Delete Workplace');
    });

    it('should not display a Delete Workplace link if the workplace has subsidiaries', async () => {
      const { component } = await setup(true, 1);

      expect(component.queryByText('Delete Workplace')).toBeNull();
    });

    it('should not display a Delete Workplace link if user not an admin', async () => {
      const { component } = await setup(false);

      expect(component.queryByText('Delete Workplace')).toBeNull();
    });

    it('should display a modal when the user clicks on Delete Workplace', async () => {
      const { component } = await setup(true);

      const deleteWorkplace = component.getByText('Delete Workplace');
      deleteWorkplace.click();

      const dialog = await within(document.body).findByRole('dialog');

      const cancel = within(dialog).getByText('Cancel');
      cancel.click();
    });

    it('should send a DELETE request once the user confirms to Delete Workplace', async () => {
      const { component, establishmentService } = await setup(true);

      const spy = spyOn(establishmentService, 'deleteWorkplace');

      const deleteWorkplace = component.getByText('Delete Workplace');
      deleteWorkplace.click();

      const dialog = await within(document.body).findByRole('dialog');
      const confirm = within(dialog).getByText('Delete workplace');
      confirm.click();

      expect(spy).toHaveBeenCalled();
    });

    it('should redirect the user after deleting a workplace', async () => {
      const { component, establishmentService, router } = await setup(true);

      spyOn(establishmentService, 'deleteWorkplace').and.returnValue(of({}));
      const spy = spyOn(router, 'navigate');
      spy.and.returnValue(Promise.resolve({}));

      const deleteWorkplace = component.getByText('Delete Workplace');
      deleteWorkplace.click();

      const dialog = await within(document.body).findByRole('dialog');
      const confirm = within(dialog).getByText('Delete workplace');
      confirm.click();

      expect(spy).toHaveBeenCalled();
    });
  });
});

