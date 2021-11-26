import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { SearchForUserComponent } from './search-for-user.component';

describe('SearchForUserComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId } = await render(SearchForUserComponent, {
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

    return {
      component,
      getByText,
      getByTestId,
    };
  }

  it('should render a SearchForUserComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should call searchUsers with fields set to null when clicking search button with nothing entered', async () => {
    const { component, getByTestId } = await setup();

    const searchUsersSpy = spyOn(component, 'searchUsers');

    const searchButton = getByTestId('searchButton');
    fireEvent.click(searchButton);

    expect(searchUsersSpy).toHaveBeenCalledWith({
      username: null,
      name: null,
      emailAddress: null,
    });
  });

  it('should call searchUsers with entered username when clicking search button', async () => {
    const { component, getByTestId } = await setup();

    const searchUsersSpy = spyOn(component, 'searchUsers');
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
    const { component, getByTestId } = await setup();

    const searchUsersSpy = spyOn(component, 'searchUsers');
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
});
