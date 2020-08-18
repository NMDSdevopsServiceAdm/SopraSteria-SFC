import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  it('should render the search component', async () => {
    await render(SearchComponent, {
      detectChanges: false,
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        SharedModule,
        RouterTestingModule.withRoutes([
          { path: 'search-groups', component: SearchComponent }
        ]),
      ],
    });
  });

  describe('Groups', () => {
    it('should show the Groups tab', async () => {
      const { fixture, navigate, getByText } = await render(SearchComponent, {
        detectChanges: false,
        imports: [
          FormsModule,
          ReactiveFormsModule,
          HttpClientTestingModule,
          SharedModule,
          RouterTestingModule.withRoutes([
            { path: 'search-groups', component: SearchComponent }
          ]),
        ],
      });

      await navigate('search-groups');

      fixture.detectChanges();

      expect(getByText('Search for a group'));
    });

    it('should render the search results when searching for a group', async () => {
      const { fixture, navigate, click, getByText, getByTestId } = await render(SearchComponent, {
        detectChanges: false,
        imports: [
          FormsModule,
          ReactiveFormsModule,
          HttpClientTestingModule,
          SharedModule,
          RouterTestingModule.withRoutes([
            { path: 'search-groups', component: SearchComponent }
          ]),
        ],
      });

      const httpTestingController = TestBed.inject(HttpTestingController);

      await navigate('search-groups');

      fixture.detectChanges();

      click(getByText('Search groups'));

      const req = httpTestingController.expectOne('/api/admin/search/groups');
      req.flush([{
        uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
        name: 'Workplace Name',
      }]);

      httpTestingController.verify();

      fixture.detectChanges();

      await within(getByTestId('group-search-results')).getByText('Workplace Name');
    });
  });
});
