import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GetChildWorkplacesResponse } from '@core/model/my-workplaces.model';
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
import { MockUserService, subsid1, subsid2, subsid3 } from '@core/test-utils/MockUserService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import sinon from 'sinon';

import { WorkplaceInfoPanelComponent } from '../workplace-info-panel/workplace-info-panel.component';
import { ViewMyWorkplacesComponent } from './view-my-workplaces.component';

fdescribe('ViewMyWorkplacesComponent', () => {
  async function setup(hasChildWorkplaces = true, qsParamGetMock = sinon.fake()) {
    const { fixture, getByText, getByTestId, queryByText, getByLabelText, queryByLabelText } = await render(
      ViewMyWorkplacesComponent,
      {
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
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                queryParamMap: {
                  get: qsParamGetMock,
                },
                data: {
                  childWorkplaces: hasChildWorkplaces
                    ? {
                        childWorkplaces: [subsid1, subsid2, subsid3],
                        count: 3,
                        activeWorkplaceCount: 2,
                      }
                    : {
                        childWorkplaces: [],
                        count: 0,
                        activeWorkplaceCount: 0,
                      },
                },
              },
            },
          },
        ],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();

    const permissionsService = injector.inject(PermissionsService) as PermissionsService;
    const establishmentService = TestBed.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router);

    const getChildWorkplacesSpy = spyOn(establishmentService, 'getChildWorkplaces').and.callThrough();

    return {
      router,
      component,
      fixture,
      permissionsService,
      getByText,
      getByTestId,
      queryByText,
      getByLabelText,
      queryByLabelText,
      getChildWorkplacesSpy,
      establishmentService,
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

  it('should display activeWorkplaceCount returned from getChildWorkplaces (2)', async () => {
    const { queryByText } = await setup();
    expect(queryByText('All workplaces (2)')).toBeTruthy();
  });

  it('should display no workplaces message when workplace has no child workplaces', async () => {
    const { queryByText } = await setup(false);
    expect(queryByText('There are no workplaces.')).toBeTruthy();
  });

  describe('calls getChildWorkplaces on establishmentService when using search', () => {
    it('it does not render the search bar when pagination threshold is not met', async () => {
      const { queryByLabelText } = await setup();

      const searchInput = queryByLabelText('Search child workplace records');
      expect(searchInput).toBeNull();
    });

    it('should call getChildWorkplaces with correct search term if passed', async () => {
      const { component, fixture, getByLabelText, getChildWorkplacesSpy } = await setup();

      // show search
      component.totalWorkplaceCount = 13;
      fixture.detectChanges();

      const searchInput = getByLabelText('Search child workplace records');
      expect(searchInput).toBeTruthy();

      userEvent.type(searchInput, 'search term here{enter}');

      const expectedEmit = {
        pageIndex: 0,
        itemsPerPage: 12,
        searchTerm: 'search term here',
      };

      expect(getChildWorkplacesSpy.calls.mostRecent().args[1]).toEqual(expectedEmit);
    });

    it('should reset the pageIndex before calling getChildWorkplaces when handling search', async () => {
      const { fixture, component, getByLabelText, getChildWorkplacesSpy } = await setup();

      component.totalWorkplaceCount = 13;
      fixture.detectChanges();

      fixture.componentInstance.currentPageIndex = 1;
      fixture.detectChanges();

      userEvent.type(getByLabelText('Search child workplace records'), 'search term here{enter}');
      expect(getChildWorkplacesSpy.calls.mostRecent().args[1].pageIndex).toEqual(0);
    });

    it('should render the no results returned message when 0 workplaces returned from getChildWorkplaces after search', async () => {
      const { fixture, component, getByLabelText, establishmentService, getByText } = await setup();

      component.totalWorkplaceCount = 13;
      fixture.detectChanges();

      sinon.stub(establishmentService, 'getChildWorkplaces').returns(
        of({
          childWorkplaces: [],
          count: 0,
          activeWorkplaceCount: 0,
        } as GetChildWorkplacesResponse),
      );

      const searchInput = getByLabelText('Search child workplace records');
      expect(searchInput).toBeTruthy();

      userEvent.type(searchInput, 'search term here{enter}');

      fixture.detectChanges();

      expect(getByText('There are no matching results')).toBeTruthy();
      expect(getByText('Make sure that your spelling is correct.')).toBeTruthy();
    });

    it('should not update All workplaces count when search results returned but should set workplaceCount used for pagination', async () => {
      const { component, fixture, getByLabelText, establishmentService, getByText } = await setup();

      component.totalWorkplaceCount = 13;
      fixture.detectChanges();

      sinon.stub(establishmentService, 'getChildWorkplaces').returns(
        of({
          childWorkplaces: [subsid1, subsid2, subsid3],
          count: 1,
          activeWorkplaceCount: 0,
        } as GetChildWorkplacesResponse),
      );

      const searchInput = getByLabelText('Search child workplace records');
      expect(searchInput).toBeTruthy();

      userEvent.type(searchInput, 'search term here{enter}');

      fixture.detectChanges();

      expect(getByText('All workplaces (2)'));
      expect(component.workplaceCount).toEqual(1);
    });

    it('adds the query params to the url on search', async () => {
      const { router, fixture, component, getByLabelText } = await setup();

      const routerSpy = spyOn(router, 'navigate');
      component.totalWorkplaceCount = 13;
      fixture.autoDetectChanges();

      userEvent.type(getByLabelText('Search child workplace records'), 'search term here{enter}');
      expect(routerSpy).toHaveBeenCalledWith([], {
        queryParams: { search: 'search term here' },
        queryParamsHandling: 'merge',
      });
    });

    it('sets the searchTerm if query params are found on render', async () => {
      const qsParamGetMock = sinon.mock().returns('mysupersearch');
      const { fixture, component, getByLabelText } = await setup(true, qsParamGetMock);

      component.totalWorkplaceCount = 13;
      fixture.autoDetectChanges();

      expect((getByLabelText('Search child workplace records') as HTMLInputElement).value).toBe('mysupersearch');
    });
  });
});
