import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchService } from '@core/services/admin/search/search.service';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { WindowRef } from '@core/services/window.ref';
import { buildMockAdminSearchWorkplace } from '@core/test-utils/admin/MockSearchService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of, throwError } from 'rxjs';

import { WorkplaceDropdownComponent } from '../workplace-dropdown/workplace-dropdown.component';
import { SearchForGroupComponent } from './search-for-group.component';

describe('SearchForGroupComponent', () => {
  async function setup(searchButtonClicked = false, isLocked = false, isParent = false, hasSubs = false) {
    const { fixture, getByText, getByTestId, queryByText, queryAllByText } = await render(SearchForGroupComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule.withRoutes([{ path: 'dashboard', component: DashboardComponent }]),
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [WorkplaceDropdownComponent],
      providers: [
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: SwitchWorkplaceService,
          useClass: MockSwitchWorkplaceService,
        },
        RegistrationsService,
        WindowRef,
        SearchService,
        AlertService,
      ],
    });

    const mockSearchResult = buildMockAdminSearchWorkplace(isLocked, isParent, hasSubs);
    const component = fixture.componentInstance;

    const searchService = TestBed.inject(SearchService);
    const searchGroupsSpy = spyOn(searchService, 'searchGroups').and.returnValue(of([mockSearchResult]));

    const switchWorkplaceService = TestBed.inject(SwitchWorkplaceService);
    const switchWorkplaceSpy = spyOn(switchWorkplaceService, 'navigateToWorkplace');

    const alertService = TestBed.inject(AlertService);
    const alertServiceSpy = spyOn(alertService, 'addAlert');

    if (searchButtonClicked) {
      const searchButton = getByTestId('searchButton');
      fireEvent.click(searchButton);

      fixture.detectChanges();
    }

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByText,
      queryAllByText,
      searchGroupsSpy,
      switchWorkplaceSpy,
      mockSearchResult,
      alertServiceSpy,
    };
  }

  it('should render a SearchForGroupComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should call searchGroups with employerType set to All and parent false when clicking search button with nothing changed', async () => {
    const { searchGroupsSpy } = await setup(true);

    expect(searchGroupsSpy).toHaveBeenCalledWith({
      employerType: 'All',
      parent: false,
    });
  });

  it('should call searchGroups with parent set to true when checkbox clicked and then search button', async () => {
    const { fixture, getByText, getByTestId, searchGroupsSpy } = await setup();

    const parentCheckbox = getByText('Only search for parents');
    fireEvent.click(parentCheckbox);

    const searchButton = getByTestId('searchButton');
    fireEvent.click(searchButton);

    fixture.detectChanges();

    expect(searchGroupsSpy).toHaveBeenCalledWith({
      employerType: 'All',
      parent: true,
    });
  });

  it('should call searchGroups with employerType set to Local authority (adult services) when second option from select selected and then search button clicked', async () => {
    const { fixture, getByTestId, searchGroupsSpy } = await setup();

    const select: HTMLSelectElement = fixture.debugElement.query(By.css('#employerType')).nativeElement;
    select.value = select.options[1].value;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const searchButton = getByTestId('searchButton');
    fireEvent.click(searchButton);

    expect(searchGroupsSpy).toHaveBeenCalledWith({
      employerType: 'Local Authority (adult services)',
      parent: false,
    });
  });

  it('should display alert banner when backend request fails', async () => {
    const { fixture, getByTestId, searchGroupsSpy, alertServiceSpy } = await setup();

    searchGroupsSpy.and.returnValue(throwError('Service unavailable'));

    const searchButton = getByTestId('searchButton');
    fireEvent.click(searchButton);

    fixture.detectChanges();

    expect(alertServiceSpy).toHaveBeenCalledWith({
      type: 'warning',
      message: 'There was a problem making this request',
    });
  });

  describe('Results returned from search', async () => {
    it('should show table headings after clicking search button if results returned', async () => {
      const { queryByText, queryAllByText } = await setup(true);

      expect(queryAllByText('Workplace')).toBeTruthy();
      expect(queryAllByText('Workplace ID')).toBeTruthy();
      expect(queryByText('Employer type')).toBeTruthy();
    });

    it('should show returned user data in table after clicking search button if results returned', async () => {
      const { getByTestId } = await setup(true);

      const table = within(getByTestId('group-search-results'));

      expect(table.queryByText('The One and Only')).toBeTruthy();
      expect(table.queryByText('H1003112')).toBeTruthy();
      expect(table.queryByText('Voluntary / Charity')).toBeTruthy();
    });

    it('should navigate to workplace when clicking workplace name link', async () => {
      const { getByTestId, switchWorkplaceSpy } = await setup(true);

      const searchResults = within(getByTestId('group-search-results'));
      fireEvent.click(searchResults.getByText('The One and Only'));

      await expect(switchWorkplaceSpy).toHaveBeenCalledWith('c93920e7-b373-40d3-8202-ad77f40f4629', '', 'H1003112');
    });

    describe('Dropdowns', async () => {
      it('should expand the Workplace details when clicking Open', async () => {
        const { fixture, getByTestId } = await setup(true);

        const searchResults = within(getByTestId('group-search-results'));
        fireEvent.click(searchResults.getByText('Open'));

        fixture.detectChanges();

        expect(searchResults.getByText('1 THE LANE SOMEWHERE TOWN, HAMPSHIRE, ABC123'));
        expect(searchResults.getByText('What is your favourite colour?'));
      });

      it('should collapse the Workplace details when clicking Close', async () => {
        const { getByTestId } = await setup(true);

        const searchResults = within(getByTestId('group-search-results'));

        fireEvent.click(searchResults.getByText('Open'));
        fireEvent.click(searchResults.getByText('Close'));

        expect(searchResults.queryByText('1 THE LANE SOMEWHERE TOWN, HAMPSHIRE, ABC123')).toBeNull();
        expect(searchResults.queryByText('What is your favourite colour?')).toBeNull();
      });

      it('should show a remove parent status link if the workpace is a parent but has no subsidiaries', async () => {
        const { fixture, getByTestId } = await setup(true, false, true, false);

        const searchResults = within(getByTestId('group-search-results'));

        fireEvent.click(searchResults.getByText('Open'));
        fixture.detectChanges();

        expect(searchResults.queryByText('Remove parent status')).toBeTruthy();
      });

      it('should open remove parent dialog when clicking remove parent status link', async () => {
        const { getByText } = await setup(true, false, true, false);

        const establishmentService = TestBed.inject(EstablishmentService);
        const spy = spyOn(establishmentService, 'removeParentStatus').and.returnValue(of({}));

        fireEvent.click(getByText('Open'));
        fireEvent.click(getByText('Remove parent status'));

        const removeParentStatusModal = within(document.body).getByRole('dialog');
        const confirm = within(removeParentStatusModal).getByText('Remove parent status');
        confirm.click();

        expect(spy).toHaveBeenCalled();
      });

      it('should not show a remove parent status link if the workpace is a parent but has subsidiaries', async () => {
        const { fixture, getByTestId } = await setup(true, false, true, true);

        const searchResults = within(getByTestId('group-search-results'));

        fireEvent.click(searchResults.getByText('Open'));
        fixture.detectChanges();

        expect(searchResults.queryByText('Remove parent status')).toBeFalsy();
      });

      it('should not show a remove parent status link if the workpace is not a parent', async () => {
        const { fixture, getByTestId } = await setup(true);

        const searchResults = within(getByTestId('group-search-results'));

        fireEvent.click(searchResults.getByText('Open'));
        fixture.detectChanges();

        expect(searchResults.queryByText('Remove parent status')).toBeFalsy();
      });

      it('should show any notes associated with the establishment', async () => {
        const { getByTestId } = await setup(true);

        const searchResults = within(getByTestId('group-search-results'));
        fireEvent.click(searchResults.getByText('Open'));
        fireEvent.click(searchResults.getByText('A1234567'));

        expect(searchResults.getByText('Notes')).toBeTruthy();
        expect(searchResults.getByText('Admin 1, 25 January 2021 12:00 AM', { exact: false })).toBeTruthy();
        expect(searchResults.getByText('This is a note')).toBeTruthy();
      });

      it('should not show the notes section, when there are no notes associated with the establishment', async () => {
        const { getByTestId, mockSearchResult, searchGroupsSpy } = await setup(true);
        mockSearchResult.notes = [];
        searchGroupsSpy.and.returnValue(of([mockSearchResult]));

        const searchResults = within(getByTestId('group-search-results'));
        fireEvent.click(searchResults.getByText('Open'));
        fireEvent.click(searchResults.getByText('A1234567'));

        expect(searchResults.queryByText('Notes')).toBeFalsy();
        expect(searchResults.queryByText('Admin 1, 25 January 2021 12:00 AM')).toBeFalsy();
        expect(searchResults.queryByText('This is a note')).toBeFalsy();
      });

      it('should navigate to parent workplace when clicking parent ID link', async () => {
        const { getByTestId, switchWorkplaceSpy } = await setup(true);

        const searchResults = within(getByTestId('group-search-results'));
        fireEvent.click(searchResults.getByText('Open'));
        fireEvent.click(searchResults.getByText('A1234567'));

        await expect(switchWorkplaceSpy).toHaveBeenCalledWith('c1231-b13-40d3-4141-ad77f40f4629', '', 'A1234567');
      });

      it('should open unlock user dialog when clicking unlock button', async () => {
        const { getByText } = await setup(true, true);

        const registrationsService = TestBed.inject(RegistrationsService);
        const spy = spyOn(registrationsService, 'unlockAccount').and.returnValue(of({}));

        fireEvent.click(getByText('Open'));
        fireEvent.click(getByText('Yes, unlock'));

        const adminUnlockModal = within(document.body).getByRole('dialog');
        const confirm = within(adminUnlockModal).getByText('Unlock account');
        confirm.click();

        await expect(spy).toHaveBeenCalled();
      });
    });

    describe('Number of results message', async () => {
      it('should show a no search results message when there are no search results', async () => {
        const { fixture, searchGroupsSpy, getByTestId, getByText } = await setup();

        searchGroupsSpy.and.returnValue(of([]));

        const searchButton = getByTestId('searchButton');
        fireEvent.click(searchButton);

        fixture.detectChanges();

        expect(getByText('Your search returned no results. Please refine your search criteria.'));
      });

      it('should show number of results message if results returned in singular when 1', async () => {
        const { queryByText } = await setup(true);

        expect(queryByText('Your search returned 1 result')).toBeTruthy();
      });

      it('should show number of results message if results returned in plural when more than 1', async () => {
        const { searchGroupsSpy, fixture, getByTestId, queryByText, mockSearchResult } = await setup();

        searchGroupsSpy.and.returnValue(of([mockSearchResult, mockSearchResult]));

        const searchButton = getByTestId('searchButton');
        fireEvent.click(searchButton);

        fixture.detectChanges();

        expect(queryByText('Your search returned 2 results')).toBeTruthy();
      });
    });
  });
});
