import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentSearchItem } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of } from 'rxjs';

import { WorkplaceDropdownComponent } from '../workplace-dropdown/workplace-dropdown.component';
import { SearchForGroupComponent } from './search-for-group.component';

describe('SearchForGroupComponent', () => {
  async function setup(searchButtonClicked = false, isLocked = false) {
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
      lastUpdated: new Date('2021-11-26T12:36:12.047Z'),
      locationId: null,
      name: 'The One and Only',
      nmdsId: 'H1003112',
      parent: {
        uid: 'c1231-b13-40d3-4141-ad77f40f4629',
        nmdsId: 'A1234567',
      },
      postcode: 'ABC123',
      town: 'SOMEWHERE TOWN',
      uid: 'c93920e7-b373-40d3-8202-ad77f40f4629',
      users: [
        {
          isLocked,
          name: 'Bob Bobson',
          securityAnswer: 'Blue maybe',
          securityQuestion: 'What is your favourite colour?',
          uid: '60a22dd6-7fe0-4105-93f0-34946917768c',
          username: 'bobby',
        },
      ],
    } as EstablishmentSearchItem;

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

        expect(searchResults.queryByTestId('groups-workplace-details')).toBeNull();
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
