import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserAccountsSummaryComponent } from '@shared/components/user-accounts-summary/user-accounts-summary.component';

import { Establishment } from '../../../../mockdata/establishment';
import { UserService } from '@core/services/user.service';
import { MockUserService } from '@core/test-utils/MockUserService';
import { SharedModule } from '@shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { WindowRef } from '@core/services/window.ref';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { HttpClient } from '@angular/common/http';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { AuthService } from '@core/services/auth.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';

describe('UserAccountsSummaryComponent', () => {
  async function setup(isAdmin = true, subsidiaries = 0) {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(subsidiaries, isAdmin),
          deps: [HttpClient],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
      ],
    });
    const fixture = TestBed.createComponent(UserAccountsSummaryComponent);
    const component: UserAccountsSummaryComponent = fixture.componentInstance;
    return {
      component,
      fixture,
    };
  }

  it('should render a User Account Summary Workplace Component', async () => {
    const { component, fixture } = await setup();
    fixture.componentInstance.workplace = Establishment;
    expect(component).toBeTruthy();
  });
  it('should still show Add User if existing user doesnt have a name', async () => {
    const { component, fixture } = await setup();

    fixture.componentInstance.workplace = Establishment;
    fixture.componentInstance.workplace.uid = '4698f4a4-ab82-4906-8b0e-3f4972375927';

    component.ngOnInit();
    expect(component.users.length).toEqual(1);
    expect(component.canAddUser).toBeTruthy();
  });

  it('should not be able to add user if 3 edit users exist', async () => {
    const { component, fixture } = await setup();

    fixture.componentInstance.workplace = Establishment;
    fixture.componentInstance.workplace.uid = 'overLimit';
    fixture.componentInstance.workplace.isParent = false;

    component.ngOnInit();
    expect(component.users.length).toEqual(6);
    expect(component.canAddUser).toBeFalsy();
  });
});
