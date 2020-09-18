import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';

import { SearchComponent } from './search.component';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { WindowRef } from '@core/services/window.ref';

const getSearchComponent = async () => {
  return render(SearchComponent, {
    detectChanges: false,
    imports: [
      FormsModule,
      ReactiveFormsModule,
      HttpClientTestingModule,
      SharedModule,
      RouterTestingModule.withRoutes([
        { path: 'search-users', component: SearchComponent },
        { path: 'search-groups', component: SearchComponent },
      ]),
    ],
    providers: [
      {
        provide: WindowRef,
        useClass: WindowRef,
      },
      {
        provide: SwitchWorkplaceService,
        useClass: MockSwitchWorkplaceService,
      },
    ],
  });
};

const setup = async (fixture, navigate, click, getByText, isLocked = false) => {
  const httpTestingController = TestBed.inject(HttpTestingController);

  await navigate('search-users');

  fixture.detectChanges();

  click(getByText('Search users'));

  const req = httpTestingController.expectOne('/api/admin/search/users');
  req.flush([
    {
      uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
      name: 'John Doe',
      username: 'Username',
      securityQuestion: 'Question',
      securityQuestionAnswer: 'Answer',
      isLocked,
      establishment: {
        uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
        name: 'My workplace',
        nmdsId: 'G1001376',
      },
    },
  ]);

  fixture.detectChanges();
};

describe('SearchComponent', () => {
  afterEach(() => {
    const httpTestingController = TestBed.inject(HttpTestingController);
    httpTestingController.verify();
  });

  describe('Users', () => {
    it('should show the Users tab', async () => {
      const { fixture, navigate, getByText } = await getSearchComponent();

      await navigate('search-users');

      fixture.detectChanges();

      expect(getByText('Search for a user'));
    });

    it('should render the search results when searching for a user', async () => {
      const { fixture, navigate, click, getByText, getByTestId } = await getSearchComponent();

      await setup(fixture, navigate, click, getByText);

      await within(getByTestId('user-search-results')).getByText('John Doe');
    });

    it('should expand the User details when clicking Open', async () => {
      const { fixture, navigate, click, getByText, getByTestId } = await getSearchComponent();

      await setup(fixture, navigate, click, getByText);

      const searchResults = within(getByTestId('user-search-results'));
      click(searchResults.getByText('Open'));

      expect(searchResults.getByText('My workplace'));
    });

    it('should nagivate to workplace when clicking workplace id link', async () => {
      const { fixture, navigate, click, getByText, getByTestId } = await getSearchComponent();

      await setup(fixture, navigate, click, getByText);

      const switchWorkplaceService = TestBed.inject(SwitchWorkplaceService);

      const spy = spyOn(switchWorkplaceService, 'navigateToWorkplace');

      const searchResults = within(getByTestId('user-search-results'));
      click(searchResults.getByText('G1001376'));

      await expect(spy).toHaveBeenCalled();
    });

    it('should nagivate to workplace when clicking workplace name link', async () => {
      const { fixture, navigate, click, getByText, getByTestId } = await getSearchComponent();

      await setup(fixture, navigate, click, getByText);

      const switchWorkplaceService = TestBed.inject(SwitchWorkplaceService);

      const spy = spyOn(switchWorkplaceService, 'navigateToWorkplace');

      const searchResults = within(getByTestId('user-search-results'));
      click(searchResults.getByText('Open'));
      click(searchResults.getByText('My workplace'));

      await expect(spy).toHaveBeenCalled();
    });

    it('should nagivate to open unlock user dialog when clicking unlock button', async () => {
      const { fixture, navigate, click, getByText, getByTestId } = await getSearchComponent();

      await setup(fixture, navigate, click, getByText, true);

      const searchResults = within(getByTestId('user-search-results'));
      click(searchResults.getByText('Open'));
      click(searchResults.getByText('Yes, unlock'));

      fixture.detectChanges();

      const adminUnlockModal = within(document.body).getByRole('dialog');

      expect(adminUnlockModal).toBeTruthy();
    });
  });

  describe('Groups', () => {
    it('should show the Groups tab', async () => {
      const { fixture, navigate, getByText } = await getSearchComponent();

      await navigate('search-groups');

      fixture.detectChanges();

      expect(getByText('Search for a group'));
    });

    it('should render the search results when searching for a group', async () => {
      const { fixture, navigate, click, getByText, getByTestId } = await getSearchComponent();

      const httpTestingController = TestBed.inject(HttpTestingController);

      await navigate('search-groups');

      fixture.detectChanges();

      click(getByText('Search groups'));

      const req = httpTestingController.expectOne('/api/admin/search/groups');
      req.flush([
        {
          uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
          name: 'Workplace Name',
        },
      ]);

      fixture.detectChanges();

      await within(getByTestId('group-search-results')).getByText('Workplace Name');
    });

    it('should expand the Workplace details when clicking Open', async () => {
      const { fixture, navigate, click, getByText, getByTestId } = await getSearchComponent();

      const httpTestingController = TestBed.inject(HttpTestingController);

      await navigate('search-groups');

      fixture.detectChanges();

      click(getByText('Search groups'));

      const req = httpTestingController.expectOne('/api/admin/search/groups');
      req.flush([
        {
          uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
          name: 'Workplace Name',
          address1: '44',
          address2: 'Grace St',
          town: 'Leeds',
          county: 'West Yorkshire',
          postcode: 'WF14 9TS',
        },
      ]);

      fixture.detectChanges();

      const searchResults = within(getByTestId('group-search-results'));
      click(searchResults.getByText('Open'));

      expect(searchResults.getByText('44 Grace St, Leeds, West Yorkshire, WF14 9TS'));
    });

    it('should collapse the Workplace details when clicking Close', async () => {
      const { fixture, navigate, click, getByText, getByTestId } = await getSearchComponent();

      const httpTestingController = TestBed.inject(HttpTestingController);

      await navigate('search-groups');

      fixture.detectChanges();

      click(getByText('Search groups'));

      const req = httpTestingController.expectOne('/api/admin/search/groups');
      req.flush([
        {
          uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
          name: 'Workplace Name',
          address1: '44',
          address2: 'Grace St',
          town: 'Leeds',
          county: 'West Yorkshire',
          postcode: 'WF14 9TS',
        },
      ]);

      fixture.detectChanges();

      const searchResults = within(getByTestId('group-search-results'));
      click(searchResults.getByText('Open'));
      click(searchResults.getByText('Close'));

      expect(searchResults.queryByTestId('groups-workplace-details')).toBeNull();
    });

    it('should show a warning when there are no search results', async () => {
      const { fixture, navigate, click, getByText, getByTestId } = await getSearchComponent();

      const httpTestingController = TestBed.inject(HttpTestingController);

      await navigate('search-groups');

      fixture.detectChanges();

      click(getByText('Search groups'));

      const req = httpTestingController.expectOne('/api/admin/search/groups');
      req.flush([]);

      fixture.detectChanges();

      expect(getByTestId('no-search-results'));
    });
  });
});
