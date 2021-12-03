import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchService } from '@core/services/admin/search/search.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { SearchForWorkplaceComponent } from './search-for-workplace.component';

describe('SearchForWorkplaceComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId, queryAllByText, queryByText } = await render(SearchForWorkplaceComponent, {
      imports: [
        SharedModule,
        RouterModule,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
      ],
      providers: [
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: SwitchWorkplaceService,
          useClass: MockSwitchWorkplaceService,
        },
        SearchService,
      ],
    });

    const mockSearchResult = {
      address1: '1 some street',
      name: 'Care Home 1',
      dataOwner: 'Workplace',
      isRegulated: true,
      locationId: '1-1111111111',
      providerId: '1-2222222222',
      nmdsId: 'A111111',
      postcode: 'AB1 2CD',
      town: 'Leeds',
      uid: 'cd3bbca7-2913-4ba7-bb2d-01014be5c48f',
      users: [
        {
          isLocked: false,
          name: 'John Doe',
          securityAnswer: 'Water Polo',
          securityQuestion: 'What is your favourite sport',
          uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
          username: 'johnDoe',
        },
      ],
      notes: [
        {
          createdAt: new Date('25/01/2021'),
          note: 'This is a note',
          user: { FullNameValue: 'Admin 1' },
        },
      ],
    };
    const component = fixture.componentInstance;

    const searchService = TestBed.inject(SearchService);
    const searchWorkplaceSpy = spyOn(searchService, 'searchWorkplaces').and.returnValue(of([mockSearchResult]));

    const switchWorkplaceService = TestBed.inject(SwitchWorkplaceService);
    const switchWorkplaceSpy = spyOn(switchWorkplaceService, 'navigateToWorkplace');

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
      form.controls['name'].setValue('Care Home 1');
      form.controls['name'].markAsDirty();

      const searchButton = getByText('Search');
      fireEvent.click(searchButton);

      expect(searchWorkplaceSpy).toHaveBeenCalledWith({
        name: 'Care Home 1',
        postcode: null,
        nmdsId: null,
        locationId: null,
        provId: null,
      });
    });

    it('should call searchWorkplace with the entered fields when clicking search button', async () => {
      const { component, getByText, searchWorkplaceSpy } = await setup();

      const form = component.form;
      form.controls['name'].setValue('Care Home 1');
      form.controls['name'].markAsDirty();
      form.controls['postcode'].setValue('AB1 2CD');
      form.controls['postcode'].markAsDirty();
      form.controls['nmdsId'].setValue('A111111');
      form.controls['nmdsId'].markAsDirty();
      form.controls['locationId'].setValue('1-1111111111');
      form.controls['locationId'].markAsDirty();
      form.controls['provId'].setValue('1-2222222222');
      form.controls['provId'].markAsDirty();

      const searchButton = getByText('Search');
      fireEvent.click(searchButton);

      expect(searchWorkplaceSpy).toHaveBeenCalledWith({
        name: 'Care Home 1',
        postcode: 'AB1 2CD',
        nmdsId: 'A111111',
        locationId: '1-1111111111',
        provId: '1-2222222222',
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
      const { fixture, getByText } = await setup();

      const searchButton = getByText('Search');
      fireEvent.click(searchButton);
      fixture.detectChanges();

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
      const { fixture, queryAllByText, getByText } = await setup();

      const searchButton = getByText('Search');
      fireEvent.click(searchButton);
      fixture.detectChanges();

      expect(queryAllByText('Workplace')).toBeTruthy();
      expect(queryAllByText('Postcode').length).toEqual(2);
      expect(queryAllByText('Workplace ID').length).toEqual(2);
      expect(queryAllByText('Location ID').length).toEqual(2);
      expect(queryAllByText('Provider ID').length).toEqual(2);
    });

    it('should show data in the table if search results are returned', async () => {
      const { fixture, queryByText, getByText } = await setup();

      const searchButton = getByText('Search');
      fireEvent.click(searchButton);
      fixture.detectChanges();

      expect(queryByText('Care Home 1')).toBeTruthy();
      expect(queryByText('AB1 2CD')).toBeTruthy();
      expect(queryByText('A111111')).toBeTruthy();
      expect(queryByText('1-1111111111')).toBeTruthy();
      expect(queryByText('1-2222222222')).toBeTruthy();
    });
  });

  describe('links', () => {
    it('should navigate to the workplace when the workplace name link is clicked', async () => {
      const { fixture, getByTestId, getByText, switchWorkplaceSpy } = await setup();

      const searchButton = getByText('Search');
      fireEvent.click(searchButton);
      fixture.detectChanges();

      const workplaceLink = getByTestId('name-link');
      fireEvent.click(workplaceLink);

      expect(switchWorkplaceSpy).toHaveBeenCalledWith('cd3bbca7-2913-4ba7-bb2d-01014be5c48f', '', 'A111111');
    });

    it('should navigate to the workplace when the workplace ID link is clicked', async () => {
      const { fixture, getByTestId, getByText, switchWorkplaceSpy } = await setup();

      const searchButton = getByText('Search');
      fireEvent.click(searchButton);
      fixture.detectChanges();

      const workplaceIdLink = getByTestId('workplaceId-link');
      fireEvent.click(workplaceIdLink);

      expect(switchWorkplaceSpy).toHaveBeenCalledWith('cd3bbca7-2913-4ba7-bb2d-01014be5c48f', '', 'A111111');
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
});
