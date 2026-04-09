import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import lodash from 'lodash';

import { SearchInputAutoSuggestComponent } from './search-input-auto-suggest.component';
import userEvent from '@testing-library/user-event';

fdescribe('SearchInputAutoSuggestComponent', () => {
  const jobs = ['Registered Nurse', 'Care worker', 'Care coordinator'];
  const mockDataProvider = (textInput: string) => {
    return jobs.filter((job) => job.toLowerCase().includes(textInput.toLowerCase()));
  };

  const setup = async (overrides: any = {}) => {
    const componentProperties = {
      dataProvider: mockDataProvider,
      ...lodash.pick(overrides, [
        'label',
        'showSearchButton',
        'searchButtonName',
        'accessibleLabel',
        'inputBoxId',
        'ref',
      ]),
    };

    const setupTools = await render(SearchInputAutoSuggestComponent, {
      imports: [FormsModule, SharedModule, ReactiveFormsModule],
      componentProperties,
    });

    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
  };
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a input textbox', async () => {
    const { getByRole } = await setup();
    expect(getByRole('textbox', { name: 'Search' })).toBeTruthy();
  });

  it('should show a search button if showSearchButton is true', async () => {
    const { queryByRole } = await setup({ showSearchButton: true });

    expect(queryByRole('button', { name: 'search' })).toBeTruthy();
  });

  it('should not show the search button if showSearchButton is false', async () => {
    const { queryByRole } = await setup({ showSearchButton: false });

    expect(queryByRole('button', { name: 'search' })).toBeFalsy();
  });

  it('should allow a custom search button name', async () => {
    const { getByRole } = await setup({ searchButtonName: 'special name', showSearchButton: true });

    expect(getByRole('button', { name: 'special name' })).toBeTruthy();
  });

  it('should allow an accessibleLabel to be added for screen readers', async () => {
    const { getByLabelText } = await setup({ label: 'Search', accessibleLabel: 'for something' });

    expect(getByLabelText('Search for something')).toBeTruthy();
  });

  it('should emit the suggestion as search term when clicked on a suggestion', async () => {
    const { component, getByLabelText, getByText } = await setup();

    const emitSpy = spyOn(component.emitInput, 'emit');

    userEvent.type(getByLabelText('Search'), 'care');
    userEvent.click(getByText('Care worker'));

    expect(emitSpy).toHaveBeenCalledOnceWith('Care worker');
  });

  it('should display a "Clear search results" link after user submit a search', async () => {
    const { component, getByLabelText, getByText } = await setup();

    const emitSpy = spyOn(component.emitInput, 'emit');
    userEvent.type(getByLabelText('Search'), 'care');

    userEvent.click(getByText('Care worker'));
    expect(emitSpy).toHaveBeenCalledOnceWith('Care worker');

    const clearSearchLink = getByText('Clear search results');
    expect(clearSearchLink).toBeTruthy();

    userEvent.click(clearSearchLink);
    expect(emitSpy).toHaveBeenCalledWith('');
  });

  it('should emit the user input when search button is clicked', async () => {
    const { component, getByLabelText, getByRole } = await setup({ showSearchButton: true });

    const emitSpy = spyOn(component.emitInput, 'emit');

    userEvent.type(getByLabelText('Search'), 'care');

    userEvent.click(getByRole('button', { name: 'search' }));

    expect(emitSpy).toHaveBeenCalledOnceWith('care');
  });

  it('should not emit search if searchTerm is empty and user clicked search button', async () => {
    const { component, getByRole } = await setup({ showSearchButton: true });

    const emitSpy = spyOn(component.emitInput, 'emit');

    userEvent.click(getByRole('button', { name: 'search' }));

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should use the given id as input box id', async () => {
    const { getByLabelText } = await setup({ inputBoxId: 'my-input-id' });

    const searchInput = getByLabelText('Search');
    expect(searchInput).toBeTruthy();

    expect(searchInput.id).toBe('my-input-id');
  });

  it('should handle the legacy "ref" input property as input box id', async () => {
    const { getByLabelText } = await setup({ ref: 'my-input-id' });

    const searchInput = getByLabelText('Search');
    expect(searchInput).toBeTruthy();

    expect(searchInput.id).toBe('my-input-id');
  });
});
