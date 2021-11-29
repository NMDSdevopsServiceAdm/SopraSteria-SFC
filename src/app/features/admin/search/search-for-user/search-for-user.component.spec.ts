import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { SearchForUserComponent } from './search-for-user.component';

describe('SearchForUserComponent', () => {
  const mockSearchResults = [
    {
      uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
      name: 'John Doe',
      username: 'johnUsername',
      securityQuestion: 'Question',
      securityQuestionAnswer: 'Answer',
      isLocked: false,
      establishment: {
        uid: 'ad3bbca7-2913-4ba7-bb2d-01014be5c48f',
        name: 'My workplace',
        nmdsId: 'G1001376',
        postcode: 'ABC123',
      },
    },
  ];

  async function setup() {
    const { fixture, getByText, getByTestId, queryByText, queryAllByText } = await render(SearchForUserComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
    });

    const component = fixture.componentInstance;
    const searchUsersSpy = spyOn(component, 'searchUsers').and.returnValue(of({ body: mockSearchResults }));

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByText,
      queryAllByText,
      searchUsersSpy,
    };
  }

  it('should render a SearchForUserComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should call searchUsers with fields set to null when clicking search button with nothing entered', async () => {
    const { getByTestId, searchUsersSpy } = await setup();

    const searchButton = getByTestId('searchButton');
    fireEvent.click(searchButton);

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

  describe('Results returned from search', async () => {
    it('should show table headings after clicking search button if results returned', async () => {
      const { fixture, queryByText, queryAllByText, getByTestId } = await setup();

      const searchButton = getByTestId('searchButton');
      fireEvent.click(searchButton);

      fixture.detectChanges();

      expect(queryAllByText('Name')).toBeTruthy();
      expect(queryAllByText('Username')).toBeTruthy();
      expect(queryByText('Workplace ID')).toBeTruthy();
      expect(queryByText('Postcode')).toBeTruthy();
    });

    it('should show returned user data in table after clicking search button if results returned', async () => {
      const { fixture, queryByText, getByTestId } = await setup();

      const searchButton = getByTestId('searchButton');
      fireEvent.click(searchButton);

      fixture.detectChanges();

      expect(queryByText('John Doe')).toBeTruthy();
      expect(queryByText('johnUsername')).toBeTruthy();
      expect(queryByText('G1001376')).toBeTruthy();
      expect(queryByText('ABC123')).toBeTruthy();
    });

    it("should show a flag when user's workplace is pending", async () => {
      const { component, fixture, getByTestId } = await setup();

      const searchButton = getByTestId('searchButton');
      fireEvent.click(searchButton);

      fixture.detectChanges();

      component.results[0].establishment.ustatus = 'PENDING';
      fixture.detectChanges();

      const result = getByTestId('user-search-results').querySelector('img');
      expect(result.src).toContain('flag-orange');
    });
  });
});
