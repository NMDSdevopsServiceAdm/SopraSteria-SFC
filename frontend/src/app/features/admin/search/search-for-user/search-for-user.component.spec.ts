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
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of, throwError } from 'rxjs';

import { SearchForUserComponent } from './search-for-user.component';

describe('SearchForUserComponent', () => {
  async function setup(searchButtonClicked = false, isLocked = false) {
    const { fixture, getByText, getByTestId, queryByText, queryAllByText } = await render(SearchForUserComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
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

    const mockSearchResult = {
      uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
      name: 'John Doe',
      username: 'johnUsername',
      securityQuestion: 'What is your favourite sport?',
      securityQuestionAnswer: 'Water Polo',
      isLocked,
      establishment: {
        uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
        name: 'My workplace',
        nmdsId: 'G1001376',
        postcode: 'ABC123',
      },
    };

    const component = fixture.componentInstance;
    const searchService = TestBed.inject(SearchService);
    const searchUsersSpy = spyOn(searchService, 'searchUsers').and.returnValue(of([mockSearchResult]));

    const switchWorkplaceService = TestBed.inject(SwitchWorkplaceService);
    const switchWorkplaceSpy = spyOn(switchWorkplaceService, 'navigateToWorkplace');

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
      searchUsersSpy,
      switchWorkplaceSpy,
      mockSearchResult,
    };
  }

  it('should render a SearchForUserComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should call searchUsers with fields set to null when clicking search button with nothing entered', async () => {
    const { searchUsersSpy } = await setup(true);

    expect(searchUsersSpy).toHaveBeenCalledWith({
      username: null,
      name: null,
      emailAddress: null,
    });
  });

  it('should call searchUsers with entered username when clicking search button', async () => {
    const { component, getByTestId, searchUsersSpy } = await setup();

    const form = component.form;

    form.controls['username'].setValue('bob');
    form.controls['username'].markAsDirty();

    const searchButton = getByTestId('searchButton');
    fireEvent.click(searchButton);

    expect(searchUsersSpy).toHaveBeenCalledWith({
      username: 'bob',
      name: null,
      emailAddress: null,
    });
  });

  it('should call searchUsers with entered name and emailAddress when clicking search button', async () => {
    const { component, getByTestId, searchUsersSpy } = await setup();

    const form = component.form;

    form.controls['name'].setValue('Bob Monkhouse');
    form.controls['name'].markAsDirty();

    form.controls['emailAddress'].setValue('bob@email.com');
    form.controls['emailAddress'].markAsDirty();

    const searchButton = getByTestId('searchButton');
    fireEvent.click(searchButton);

    expect(searchUsersSpy).toHaveBeenCalledWith({
      username: null,
      name: 'Bob Monkhouse',
      emailAddress: 'bob@email.com',
    });
  });

  it('should display an alert banner when the request fails', async () => {
    const { getByText, searchUsersSpy } = await setup();

    const alertService = TestBed.inject(AlertService);
    const alertServiceSpy = spyOn(alertService, 'addAlert');
    searchUsersSpy.and.returnValue(throwError('Service unavailable'));

    const searchButton = getByText('Search');
    fireEvent.click(searchButton);

    expect(alertServiceSpy).toHaveBeenCalledWith({
      type: 'warning',
      message: 'There was a problem making this request',
    });
  });

  describe('Results returned from search', async () => {
    it('should show table headings after clicking search button if results returned', async () => {
      const { queryByText, queryAllByText } = await setup(true);

      expect(queryAllByText('Name')).toBeTruthy();
      expect(queryAllByText('Username')).toBeTruthy();
      expect(queryByText('Workplace ID')).toBeTruthy();
      expect(queryByText('Postcode')).toBeTruthy();
    });

    it('should show returned user data in table after clicking search button if results returned', async () => {
      const { queryByText } = await setup(true);

      expect(queryByText('John Doe')).toBeTruthy();
      expect(queryByText('johnUsername')).toBeTruthy();
      expect(queryByText('G1001376')).toBeTruthy();
      expect(queryByText('ABC123')).toBeTruthy();
    });

    it(`should show a flag when user's workplace is pending`, async () => {
      const { component, fixture, getByTestId } = await setup(true);

      component.results[0].establishment.ustatus = 'PENDING';
      fixture.detectChanges();

      const result = getByTestId('user-search-results').querySelector('img');
      expect(result.src).toContain('flag-orange');
    });

    it('should navigate to workplace when clicking workplace ID link', async () => {
      const { getByTestId, switchWorkplaceSpy } = await setup(true);

      const searchResults = within(getByTestId('user-search-results'));
      fireEvent.click(searchResults.getByText('G1001376'));

      await expect(switchWorkplaceSpy).toHaveBeenCalledWith(
        'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
        'johnUsername',
        null,
      );
    });

    describe('Number of results message', async () => {
      it('should show a no search results message when there are no search results', async () => {
        const { fixture, searchUsersSpy, getByTestId } = await setup();

        searchUsersSpy.and.returnValue(of([]));

        const searchButton = getByTestId('searchButton');
        fireEvent.click(searchButton);

        fixture.detectChanges();

        expect(getByTestId('no-search-results'));
      });

      it('should show number of results message if results returned in singular when 1', async () => {
        const { queryByText } = await setup(true);

        expect(queryByText('Your search returned 1 result')).toBeTruthy();
      });

      it('should show number of results message if results returned in plural when more than 1', async () => {
        const { searchUsersSpy, fixture, getByTestId, queryByText, mockSearchResult } = await setup();

        searchUsersSpy.and.returnValue(of([mockSearchResult, mockSearchResult]));

        const searchButton = getByTestId('searchButton');
        fireEvent.click(searchButton);

        fixture.detectChanges();

        expect(queryByText('Your search returned 2 results')).toBeTruthy();
      });
    });

    describe('Dropdown', async () => {
      it('should expand the User details when clicking Open', async () => {
        const { getByTestId } = await setup(true);

        const searchResults = within(getByTestId('user-search-results'));
        fireEvent.click(searchResults.getByText('Open'));

        expect(searchResults.getByText('My workplace'));
        expect(searchResults.getByText('What is your favourite sport?'));
        expect(searchResults.getByText('Water Polo'));
      });

      it('should navigate to workplace when clicking workplace name link', async () => {
        const { getByTestId, switchWorkplaceSpy } = await setup(true);

        const searchResults = within(getByTestId('user-search-results'));
        fireEvent.click(searchResults.getByText('Open'));
        fireEvent.click(searchResults.getByText('My workplace'));

        await expect(switchWorkplaceSpy).toHaveBeenCalledWith(
          'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
          'johnUsername',
          null,
        );
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
  });
});
