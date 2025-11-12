import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockUserService, nonPrimaryEditUser } from '@core/test-utils/MockUserService';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { render } from '@testing-library/angular';

import { WorkplaceModule } from '../workplace.module';
import { UserAccountEditPermissionsComponent } from './user-account-edit-permissions.component';

describe('UserAccountEditPermissionsComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(UserAccountEditPermissionsComponent, {
      imports: [RouterModule, WorkplaceModule],
      providers: [
        BackService,
        AlertService,
        WindowRef,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: UserService,
          useClass: MockUserService,
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
                user: nonPrimaryEditUser,
              },
            },
            parent: {
              snapshot: {
                url: [{ path: 'workplace' }],
                data: {
                  establishment: {
                    id: 'abc123',
                    uid: 'activeEditUser',
                    name: 'abc123',
                  },
                },
              },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const injector = getTestBed();
    const parentSubsidiaryViewService = injector.inject(ParentSubsidiaryViewService) as ParentSubsidiaryViewService;

    const component = fixture.componentInstance;

    return { component, fixture, getByText, parentSubsidiaryViewService };
  }

  it('should render a UserAccountEditPermissionsComponent', async () => {
    const component = await setup();

    expect(component).toBeTruthy();
  });

  describe('getBreadcrumbsJourney', () => {
    it('should return subsidiary journey when viewing sub as parent', async () => {
      const { component, parentSubsidiaryViewService } = await setup();
      spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(true);
      expect(component.getBreadcrumbsJourney()).toBe(JourneyType.SUBSIDIARY);
    });

    it('should return my workplace journey when return does not have fragment set', async () => {
      const { component, fixture } = await setup();
      component.return = { fragment: null } as URLStructure;
      fixture.detectChanges();

      expect(component.getBreadcrumbsJourney()).toBe(JourneyType.MY_WORKPLACE);
    });

    it('should return all workplaces journey when return has fragment', async () => {
      const { component } = await setup();

      expect(component.getBreadcrumbsJourney()).toBe(JourneyType.ALL_WORKPLACES);
    });
  });
});
