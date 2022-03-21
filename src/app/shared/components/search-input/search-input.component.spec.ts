import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { render, waitForElementToBeRemoved } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { SearchInputComponent } from './search-input.component';

describe('SearchInputComponent', () => {
  const setup = () =>
    render(SearchInputComponent, {
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule],
    });

  it('should create', async () => {
    const component = await setup();

    expect(component).toBeTruthy();
  });

  it('renders the input and submit cta', async () => {
    const component = await setup();

    expect(component.getByLabelText('Search')).toBeTruthy();
    expect(component.getByRole('button', { name: 'search' })).toBeTruthy();
  });

  it('allows the submit button name to set', async () => {
    const component = await setup();

    expect(component.getByRole('button', { name: 'search' })).toBeTruthy();
    component.rerender({ searchButtonName: 'new name of button' });
    expect(component.getByRole('button', { name: 'new name of button' })).toBeTruthy();
  });

  it('emits the searchTerm on submit', async () => {
    const component = await setup();

    const emitSpy = spyOn(component.fixture.componentInstance.emitInput, 'emit');

    userEvent.type(component.getByLabelText('Search'), 'pete');
    userEvent.click(component.getByRole('button', { name: 'search' }));

    expect(emitSpy).toHaveBeenCalledOnceWith('pete');
  });

  it('displays "Clear search results" cta if user submits a search', async () => {
    const component = await setup();

    const emitSpy = spyOn(component.fixture.componentInstance.emitInput, 'emit');

    userEvent.type(component.getByLabelText('Search'), 'ab');
    userEvent.click(component.getByRole('button', { name: 'search' }));

    expect(emitSpy).toHaveBeenCalledOnceWith('ab');
    expect(component.findByRole('button', { name: 'Clear search results' })).toBeTruthy();
  });

  it('resets the search on clicking of "Clear search results" cta', async () => {
    const component = await setup();

    userEvent.type(component.getByLabelText('Search'), 'ab');
    userEvent.click(component.getByRole('button', { name: 'search' }));

    expect(component.findByRole('button', { name: 'Clear search results' })).toBeTruthy();

    const emitSpy = spyOn(component.fixture.componentInstance.emitInput, 'emit');
    userEvent.click(component.getByRole('button', { name: 'Clear search results' }));

    await waitForElementToBeRemoved(() => component.getByRole('button', { name: 'Clear search results' }));
    expect(component.queryByRole('button', { name: 'Clear search results' })).toBeNull();

    expect(emitSpy).toHaveBeenCalledOnceWith('');
  });

  it('does not emit search if searchTerm is an empty string', async () => {
    const component = await setup();

    const emitSpy = spyOn(component.fixture.componentInstance.emitInput, 'emit');

    userEvent.click(component.getByRole('button', { name: 'search' }));

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
