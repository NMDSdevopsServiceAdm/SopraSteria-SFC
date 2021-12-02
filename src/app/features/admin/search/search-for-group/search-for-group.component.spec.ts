import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of } from 'rxjs';

import { SearchForGroupComponent } from './search-for-group.component';

describe('SearchForGroupComponent', () => {
  async function setup(searchButtonClicked = false) {
    const { fixture, getByText, getByTestId, queryByText, queryAllByText } = await render(SearchForGroupComponent, {
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
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: SwitchWorkplaceService,
          useClass: MockSwitchWorkplaceService,
        },
        RegistrationsService,
        WindowRef,
        UserService,
      ],
    });

    const mockSearchResult = {
      address1: '1 THE LANE',
      address2: '',
      county: 'HAMPSHIRE',
      dataOwner: 'Workplace',
      employerType: { value: 'Voluntary / Charity', other: null },
      isParent: false,
      isRegulated: false,
      lastUpdated: '2021-11-26T12:36:12.047Z',
      locationId: null,
      name: 'The One and Only',
      nmdsId: 'H1003112',
      parent: {},
      postcode: 'ABC123',
      town: 'SOMEWHERE TOWN',
      uid: 'c93920e7-b373-40d3-8202-ad77f40f4629',
      users: [
        {
          isLocked: false,
          name: 'Bob Bobson',
          securityAnswer: 'Blue maybe',
          securityQuestion: 'What is your favourite colour?',
          uid: '60a22dd6-7fe0-4105-93f0-34946917768c',
          username: 'bobby',
        },
      ],
    };

    const component = fixture.componentInstance;

    const establishmentService = TestBed.inject(EstablishmentService);
    const searchGroupsSpy = spyOn(establishmentService, 'searchGroups').and.returnValue(of([mockSearchResult]));

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
      searchGroupsSpy,
      switchWorkplaceSpy,
      mockSearchResult,
    };
  }

  it('should render a SearchForGroupComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should call searchGroups with employerType set to All and onlyParents false when clicking search button with nothing changed', async () => {
    const { searchGroupsSpy } = await setup(true);

    expect(searchGroupsSpy).toHaveBeenCalledWith({
      employerType: 'All',
      onlyParents: false,
    });
  });

  it('should call searchGroups with onlyParents set to true when checkbox clicked and then search button', async () => {
    const { fixture, getByText, getByTestId, searchGroupsSpy } = await setup();

    const onlyParentsCheckbox = getByText('Only search for parents');
    fireEvent.click(onlyParentsCheckbox);

    const searchButton = getByTestId('searchButton');
    fireEvent.click(searchButton);

    fixture.detectChanges();

    expect(searchGroupsSpy).toHaveBeenCalledWith({
      employerType: 'All',
      onlyParents: true,
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
      onlyParents: false,
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

    describe('Number of results message', async () => {
      it('should show a no search results message when there are no search results', async () => {
        const { fixture, searchGroupsSpy, getByTestId } = await setup();

        searchGroupsSpy.and.returnValue(of([]));

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
