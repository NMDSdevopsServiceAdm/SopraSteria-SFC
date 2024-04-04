import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
import { ViewSubsidiaryWorkplaceUsersComponent } from './view-subsidiary-workplace-users.component';

describe('ViewSubsidiaryWorkplaceUsersComponent', () => {
  const setup = async () => {
    const { fixture } = await render(ViewSubsidiaryWorkplaceUsersComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canAddUser', 'canViewUser']),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment: establishmentBuilder() as Establishment,
              },
            },
          },
        },
      ],
    });
    const component = fixture.componentInstance;

    return { component, fixture };
  };

  it('should render a View Subsidiary Workplace Users Component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});


