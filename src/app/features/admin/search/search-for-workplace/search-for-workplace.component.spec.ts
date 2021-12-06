import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchService } from '@core/services/admin/search/search.service';
import { AlertService } from '@core/services/alert.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { WindowRef } from '@core/services/window.ref';
import { buildMockAdminSearchWorkplace } from '@core/test-utils/admin/MockSearchService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of, throwError } from 'rxjs';

import { WorkplaceDropdownComponent } from '../workplace-dropdown/workplace-dropdown.component';
import { SearchForWorkplaceComponent } from './search-for-workplace.component';

describe('SearchForWorkplaceComponent', () => {
  async function setup(searchButtonClicked = false, isLocked = false) {
    const { fixture, getByText, getByTestId, queryAllByText, queryByText } = await render(SearchForWorkplaceComponent, {
      imports: [
        SharedModule,
        RouterModule,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
      ],
      declarations: [WorkplaceDropdownComponent],
      providers: [
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: SwitchWorkplaceService,
          useClass: MockSwitchWorkplaceService,
        },
        RegistrationsService,
        SearchService,
        WindowRef,
        AlertService,
      ],
    });

    const mockSearchResult = buildMockAdminSearchWorkplace(isLocked);
    const component = fixture.componentInstance;

    const searchService = TestBed.inject(SearchService);
    const searchWorkplaceSpy = spyOn(searchService, 'searchWorkplaces').and.returnValue(of([mockSearchResult]));

    const switchWorkplaceService = TestBed.inject(SwitchWorkplaceService);
    const switchWorkplaceSpy = spyOn(switchWorkplaceService, 'navigateToWorkplace');

    if (searchButtonClicked) {
      const searchButton = getByText('Search');
      fireEvent.click(searchButton);
      fixture.detectChanges();
    }

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryAllByText,
      queryByText,
      searchWorkplaceSpy,
      mockSearchResult,
      switchWorkplaceSpy,
    };
  }

  it('should render a SearchForWorkplaceComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render initial text', async () => {
    const { getByTestId } = await setup();

    const initialText = getByTestId('initial-text');
    expect(initialText).toBeTruthy();
  });

  describe('search form', () => {
    it('should call searchWorkplace with fields set to null when clicking search button with nothing entered', async () => {
      const { getByText, searchWorkplaceSpy } = await setup();

      const searchButton = getByText('Search');
      fireEvent.click(searchButton);

      expect(searchWorkplaceSpy).toHaveBeenCalledWith({
        name: null,
        postcode: null,
        nmdsId: null,
        locationId: null,
        provId: null,
      });
    });

    it('should call searchWorkplace with the entered name when clicking search button', async () => {
      const { component, getByText, searchWorkplaceSpy } = await setup();

      const form = component.form;
      form.controls['name'].setValue('The One and Only');
      form.controls['name'].markAsDirty();

      const searchButton = getByText('Search');
      fireEvent.click(searchButton);

      expect(searchWorkplaceSpy).toHaveBeenCalledWith({
        name: 'The One and Only',
        postcode: null,
        nmdsId: null,
        locationId: null,
        provId: null,
      });
    });

    it('should call searchWorkplace with the entered fields when clicking search button', async () => {
      const { component, getByText, searchWorkplaceSpy } = await setup();

      const form = component.form;
      form.controls['name'].setValue('The One and Only');
      form.controls['name'].markAsDirty();
      form.controls['postcode'].setValue('ABC123');
      form.controls['postcode'].markAsDirty();
      form.controls['nmdsId'].setValue('H1003112');
      form.controls['nmdsId'].markAsDirty();
      form.controls['locationId'].setValue('1-1111111111');
      form.controls['locationId'].markAsDirty();
      form.controls['provId'].setValue('1-2222222222');
      form.controls['provId'].markAsDirty();

      const searchButton = getByText('Search');
      fireEvent.click(searchButton);

      expect(searchWorkplaceSpy).toHaveBeenCalledWith({
        name: 'The One and Only',
        postcode: 'ABC123',
        nmdsId: 'H1003112',
        locationId: '1-1111111111',
        provId: '1-2222222222',
      });
    });

    it('should display an alert banner when the request fails', async () => {
      const { getByText, searchWorkplaceSpy } = await setup();

      const alertService = TestBed.inject(AlertService);
      const alertServiceSpy = spyOn(alertService, 'addAlert');
      searchWorkplaceSpy.and.returnValue(throwError('Service unavailable'));

      const searchButton = getByText('Search');
      fireEvent.click(searchButton);

      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'warning',
        message: 'There was a problem making this request',
      });
    });
  });

  describe('Results returned from search', () => {
    it('should show a no search results message when the search returns no results', async () => {
      const { fixture, searchWorkplaceSpy, getByText } = await setup();
      searchWorkplaceSpy.and.returnValue(of([]));

      const searchButton = getByText('Search');
      fireEvent.click(searchButton);
      fixture.detectChanges();

      const message = 'Your search returned no results. Please refine your search criteria';
      expect(getByText(message)).toBeTruthy();
    });

    it('should show a message with the number of results returned in singular when the search return 1 workplace', async () => {
      const { getByText } = await setup(true);

      const message = 'Your search returned 1 result';
      expect(getByText(message)).toBeTruthy();
    });

    it('should show a message with the number of results returned pluralised when the search returns more than 1 workplace', async () => {
      const { fixture, getByText, searchWorkplaceSpy, mockSearchResult } = await setup();
      searchWorkplaceSpy.and.returnValue(of([mockSearchResult, mockSearchResult]));

      const searchButton = getByText('Search');
      fireEvent.click(searchButton);
      fixture.detectChanges();

      const message = 'Your search returned 2 results';
      expect(getByText(message)).toBeTruthy();
    });

    it('should show the table heading if search results are returned', async () => {
      const { queryAllByText } = await setup(true);

      expect(queryAllByText('Workplace')).toBeTruthy();
      expect(queryAllByText('Postcode').length).toEqual(2);
      expect(queryAllByText('Workplace ID').length).toEqual(2);
      expect(queryAllByText('Location ID').length).toEqual(2);
      expect(queryAllByText('Provider ID').length).toEqual(2);
    });

    it('should show data in the table if search results are returned', async () => {
      const { queryByText } = await setup(true);

      expect(queryByText('The One and Only')).toBeTruthy();
      expect(queryByText('ABC123')).toBeTruthy();
      expect(queryByText('H1003112')).toBeTruthy();
      expect(queryByText('1-1111111111')).toBeTruthy();
      expect(queryByText('1-2222222222')).toBeTruthy();
    });
  });

  describe('links', () => {
    it('should navigate to the workplace when the workplace name link is clicked', async () => {
      const { getByTestId, switchWorkplaceSpy } = await setup(true);

      const workplaceLink = getByTestId('name-link');
      fireEvent.click(workplaceLink);

      expect(switchWorkplaceSpy).toHaveBeenCalledWith('c93920e7-b373-40d3-8202-ad77f40f4629', '', 'H1003112');
    });

    it('should navigate to the workplace when the workplace ID link is clicked', async () => {
      const { getByTestId, switchWorkplaceSpy } = await setup(true);

      const workplaceIdLink = getByTestId('workplaceId-link');
      fireEvent.click(workplaceIdLink);

      expect(switchWorkplaceSpy).toHaveBeenCalledWith('c93920e7-b373-40d3-8202-ad77f40f4629', '', 'H1003112');
    });

    it('should render the location id link with an href to the cqc website', async () => {
      const { fixture, getByText, getByTestId } = await setup();

      const searchButton = getByText('Search');
      fireEvent.click(searchButton);
      fixture.detectChanges();

      const locationIdLink = getByTestId('locationId-link');
      expect(locationIdLink.getAttribute('href')).toEqual('https://www.cqc.org.uk/location/1-1111111111');
    });
  });

  describe('Dropdowns', () => {
    it('should expand the Workplace detals when click Open', async () => {
      const { fixture, getByTestId } = await setup(true);

      const searchResults = within(getByTestId('workplace-search-results'));
      fireEvent.click(searchResults.getByText('Open'));
      fixture.detectChanges();

      expect(searchResults.getByText('1 THE LANE SOMEWHERE TOWN, HAMPSHIRE, ABC123'));
      expect(searchResults.getByText('What is your favourite colour?'));
    });
  });

  it('should collapse the Workplace details when clicking Close', async () => {
    const { fixture, getByTestId } = await setup(true);

    const searchResults = within(getByTestId('workplace-search-results'));
    fireEvent.click(searchResults.getByText('Open'));
    fixture.detectChanges();

    expect(searchResults.getByText('1 THE LANE SOMEWHERE TOWN, HAMPSHIRE, ABC123'));
    expect(searchResults.getByText('What is your favourite colour?'));
  });

  it('should show any notes associated with the establishment', async () => {
    const { getByTestId } = await setup(true);

    const searchResults = within(getByTestId('workplace-search-results'));
    fireEvent.click(searchResults.getByText('Open'));
    fireEvent.click(searchResults.getByText('A1234567'));

    expect(searchResults.getByText('Notes')).toBeTruthy();
    expect(searchResults.getByText('Admin 1, 25 January 2021 12:00 AM', { exact: false })).toBeTruthy();
    expect(searchResults.getByText('This is a note')).toBeTruthy();
  });

  it('should not show the notes section, when there are no notes associated with the establishment', async () => {
    const { getByTestId, mockSearchResult, searchWorkplaceSpy } = await setup(true);
    mockSearchResult.notes = [];
    searchWorkplaceSpy.and.returnValue(of([mockSearchResult]));

    const searchResults = within(getByTestId('workplace-search-results'));
    fireEvent.click(searchResults.getByText('Open'));
    fireEvent.click(searchResults.getByText('A1234567'));

    expect(searchResults.queryByText('Notes')).toBeFalsy();
    expect(searchResults.queryByText('Admin 1, 25 January 2021 12:00 AM')).toBeFalsy();
    expect(searchResults.queryByText('This is a note')).toBeFalsy();
  });

  it('should navigate to parent workplace when clicking parent ID link', async () => {
    const { getByTestId, switchWorkplaceSpy } = await setup(true);

    const searchResults = within(getByTestId('workplace-search-results'));
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

    expect(true).toBeTruthy();
    expect(spy).toHaveBeenCalled();
  });
});
