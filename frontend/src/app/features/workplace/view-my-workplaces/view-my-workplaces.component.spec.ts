import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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

describe('ViewMyWorkplacesComponent', () => {
  async function setup(overrides: any = {}) {
    const setupTools = await render(ViewMyWorkplacesComponent, {
      imports: [SharedModule, RouterModule],
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
              data: {
                childWorkplaces:
                  overrides.hasChildWorkplaces ?? true
                    ? {
                        childWorkplaces: [subsid1, subsid2, subsid3],
                        count: overrides.totalWorkplaceCount ?? 3,
                        activeWorkplaceCount: 2,
                      }
                    : {
                        childWorkplaces: [],
                        count: 0,
                        activeWorkplaceCount: 0,
                      },
                cqcLocations:
                  overrides.hasChildWorkplaces ?? true
                    ? {
                        showMissingCqcMessage: true,
                      }
                    : {
                        showMissingCqcMessage: false,
                      },
              },
            },
          },
        },
      provideHttpClient(), provideHttpClientTesting(),],
    });

    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();

    const permissionsService = injector.inject(PermissionsService) as PermissionsService;
    const establishmentService = TestBed.inject(EstablishmentService) as EstablishmentService;

    const getChildWorkplacesSpy = spyOn(establishmentService, 'getChildWorkplaces').and.callThrough();

    return {
      ...setupTools,
      component,
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
    expect(queryByText('Your other workplaces (2)')).toBeTruthy();
  });

  it('should display no workplaces message when workplace has no child workplaces', async () => {
    const { getByTestId } = await setup({ hasChildWorkplaces: false });
    expect(getByTestId('noWorkplacesMessage')).toBeTruthy();
  });

  describe('calls getChildWorkplaces on establishmentService when using search', () => {
    it('it does not render the search bar when pagination threshold is not met', async () => {
      const { queryByLabelText } = await setup();

      const searchInput = queryByLabelText('Search child workplace records');
      expect(searchInput).toBeNull();
    });

    it('should call getChildWorkplaces with correct search term if passed', async () => {
      const { getByLabelText, getChildWorkplacesSpy } = await setup({ totalWorkplaceCount: 13 });

      const searchInput = getByLabelText('Search child workplace records');
      expect(searchInput).toBeTruthy();

      userEvent.type(searchInput, 'search term here{enter}');

      const expectedEmit = {
        pageIndex: 0,
        itemsPerPage: 12,
        searchTerm: 'search term here',
        getPendingWorkplaces: true,
        sortBy: 'workplaceNameAsc',
      };

      expect(getChildWorkplacesSpy.calls.mostRecent().args[1]).toEqual(expectedEmit);
    });

    it('should reset the pageIndex before calling getChildWorkplaces when handling search', async () => {
      const { fixture, getByLabelText, getChildWorkplacesSpy } = await setup({ totalWorkplaceCount: 13 });

      fixture.componentInstance.currentPageIndex = 1;
      fixture.detectChanges();

      userEvent.type(getByLabelText('Search child workplace records'), 'search term here{enter}');
      expect(getChildWorkplacesSpy.calls.mostRecent().args[1].pageIndex).toEqual(0);
    });

    it('should render the no results returned message when 0 workplaces returned from getChildWorkplaces after search', async () => {
      const { fixture, getByLabelText, establishmentService, getByText } = await setup({ totalWorkplaceCount: 13 });

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
      const { component, fixture, getByLabelText, establishmentService, getByText } = await setup({
        totalWorkplaceCount: 13,
      });

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

      expect(getByText('Your other workplaces (2)'));
      expect(component.workplaceCount).toEqual(1);
    });
  });

  describe('missing cqc workplaces message', () => {
    it('should not show if missingCqcWorkplaces is false ', async () => {
      const { queryByTestId } = await setup({ hasChildWorkplaces: false });

      expect(queryByTestId('missingCqcWorkplaces')).toBeFalsy();
    });

    it('should not show if missingCqcWorkplaces is true', async () => {
      const { queryByTestId } = await setup({ hasChildWorkplaces: true });

      expect(queryByTestId('missingCqcWorkplaces')).toBeTruthy();
    });

    it('should show the primary workplace name, if missingCqcWorkplaces is true', async () => {
      const { component, getByTestId } = await setup({ hasChildWorkplaces: true });

      const missingCqcWorkplacesMessage = getByTestId('missingCqcWorkplaces');

      expect(missingCqcWorkplacesMessage.textContent).toContain(component.primaryWorkplace.name);
    });

    it('should show link to CQC provider page with provider ID in url', async () => {
      const { component, getByText } = await setup({ hasChildWorkplaces: true });

      const cqcLink = getByText('Please check your CQC workplaces');

      expect(cqcLink.getAttribute('href')).toEqual(`https://www.cqc.org.uk/provider/${component.providerId}`);
    });
  });

  it('should show `What you can do as a parent workplace` link', async () => {
    const { getByText } = await setup();

    const linkText = getByText('What you can do as a parent workplace');

    expect(linkText).toBeTruthy();
    expect(linkText.getAttribute('href')).toEqual('/workplace/about-parents');
  });

  describe('sort by', () => {
    it('should not show if there are no workplaces', async () => {
      const { queryByTestId } = await setup({ hasChildWorkplaces: false });

      expect(queryByTestId('sortBy')).toBeFalsy();
    });

    it('should not show if there is 1 workplace', async () => {
      const { queryByTestId } = await setup({ hasChildWorkplaces: true, totalWorkplaceCount: 1 });

      expect(queryByTestId('sortBy')).toBeFalsy();
    });

    it('should show if there is more than 1 workplace', async () => {
      const { getByTestId } = await setup({ hasChildWorkplaces: true, totalWorkplaceCount: 5 });

      expect(getByTestId('sortBy')).toBeTruthy();
    });

    it('should add the sort-column class when there is search and pagination', async () => {
      const { fixture } = await setup({ hasChildWorkplaces: true, totalWorkplaceCount: 13 });

      const sortByDiv = fixture.nativeElement.querySelector('div[data-testid="sortBy"]');

      expect(sortByDiv.getAttribute('class')).toContain('sort-column');
      expect(sortByDiv.getAttribute('class')).not.toContain('govuk-util__float-right');
    });

    it('should add the govuk-util__float-right class when there is no search and pagination', async () => {
      const { fixture } = await setup({ hasChildWorkplaces: true, totalWorkplaceCount: 4 });

      const sortByDiv = fixture.nativeElement.querySelector('div[data-testid="sortBy"]');

      expect(sortByDiv.getAttribute('class')).not.toContain('sort-column');
      expect(sortByDiv.getAttribute('class')).toContain('govuk-util__float-right');
    });

    it('should call localStorage to get the sort to value set', async () => {
      const { component } = await setup({ hasChildWorkplaces: true });

      const sortKey = '1_asc';

      const localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(component.sortByParamMap[sortKey]);

      component.ngOnInit();

      expect(localStorageSpy).toHaveBeenCalled();
      expect(component.sortBySelectedValue).toEqual(component.sortByParamMap[sortKey]);
    });

    it('should call the sortBy function when selecting a different parameter for sorting', async () => {
      const { component, getByLabelText, getChildWorkplacesSpy } = await setup();

      const handleSortSpy = spyOn(component, 'sortBy').and.callThrough();
      const localStorageSpy = spyOn(localStorage, 'setItem');

      const sortByObjectKeys = Object.keys(component.sortOptions);
      userEvent.selectOptions(getByLabelText('Sort by'), sortByObjectKeys[1]);

      expect(handleSortSpy).toHaveBeenCalledWith(sortByObjectKeys[1]);
      const { primaryWorkplace, currentPageIndex, itemsPerPage, sortBySelectedValue } = component;
      expect(getChildWorkplacesSpy).toHaveBeenCalledWith(primaryWorkplace.uid, {
        pageIndex: currentPageIndex,
        itemsPerPage,
        getPendingWorkplaces: true,
        sortBy: sortBySelectedValue,
      });
      expect(localStorageSpy.calls.all()[0].args).toEqual(['yourOtherWorkplacesSortValue', sortBySelectedValue]);
    });
  });
});