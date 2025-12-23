import { render, within } from '@testing-library/angular';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { AutoSuggestComponent } from './auto-suggest.component';
import userEvent from '@testing-library/user-event';

describe('AutoSuggestComponent', () => {
  const formBuilder = new UntypedFormBuilder();
  const mockFormGroup = formBuilder.group({ search: [''] });

  async function setup(overrides: any = {}) {
    const dataProvider = () => {
      return overrides?.dataList ? overrides?.dataList : [];
    };
    const setupTools = await render(AutoSuggestComponent, {
      imports: [ReactiveFormsModule],
      providers: [],
      componentProperties: {
        dataProvider: dataProvider,
        formGroup: mockFormGroup,
        formControlName: 'search',
        ...overrides,
      },
    });
    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
    };
  }

  it('should create AutoSuggestComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should not show the label', async () => {
    const { queryByTestId } = await setup();

    expect(queryByTestId('label')).toBeFalsy();
  });

  it('should show the label', async () => {
    const override = {
      label: 'Search',
    };
    const { getByTestId, getByLabelText } = await setup(override);

    expect(getByTestId('label')).toBeTruthy();
    expect(getByLabelText(override.label)).toBeTruthy();
  });

  it('should not show the search icon', async () => {
    const { queryByTestId } = await setup();
    expect(queryByTestId('search-icon')).toBeFalsy();
  });

  it('should show the search icon', async () => {
    const override = {
      showSearchIcon: true,
    };
    const { getByTestId } = await setup(override);
    expect(getByTestId('search-icon')).toBeTruthy();
  });

  it('shows an accessibleLabel for screen readers if there is an accessibleLabel', async () => {
    const override = {
      label: 'Search',
      accessibleLabel: 'for something',
    };
    const component = await setup(override);

    expect(component.queryByLabelText('Search')).toBeNull();
    expect(component.getByLabelText('Search for something')).toBeTruthy();
  });

  it('does not show an accessibleLabel for screen readers if there is no accessibleLabel', async () => {
    const override = {
      label: 'Search',
    };
    const component = await setup(override);

    expect(component.queryByLabelText('Search')).toBeTruthy();
  });

  it('should not show the background', async () => {
    const override = {
      showSearchIcon: true,
      showBackground: false,
    };

    const { getByTestId } = await setup(override);

    expect(getByTestId('container').getAttribute('class')).not.toContain('govuk-util__light-bg');
  });

  it('should show the background', async () => {
    const override = {
      showSearchIcon: true,
      showBackground: true,
    };

    const { getByTestId } = await setup(override);

    expect(getByTestId('container').getAttribute('class')).toContain('govuk-util__light-bg');
  });

  it('should show the tray of items', async () => {
    const override = {
      dataList: ['staff record', 'cqc'],
    };
    const { getByTestId } = await setup(override);
    expect(getByTestId('tray-list')).toBeTruthy;
  });

  it('should show the typed value and not show the clicked value in the input if showClickedSuggestionInInput is false', async () => {
    const override = {
      dataList: ['staff record'],
      showSearchIcon: true,
      showClickedSuggestionInInput: false,
    };

    const { component, getAllByRole, getByRole, fixture } = await setup(override);

    const input = getByRole('textbox');

    userEvent.type(input, 'staff');
    userEvent.click(within(getAllByRole('listitem')[0]).getByText('staff record'));
    fixture.detectChanges();

    expect(component.formGroup.value).toEqual({ search: 'staff' });
  });

  it('should show the clicked value in the input if showClickedSuggestionInInput is true', async () => {
    const override = {
      dataList: ['staff record'],
      showSearchIcon: true,
      showClickedSuggestionInInput: true,
    };

    const { component, getAllByRole, getByRole, getByLabelText, fixture } = await setup(override);

    const input = getByRole('textbox');

    userEvent.type(input, 'staff record');
    userEvent.click(within(getAllByRole('listitem')[0]).getByText('staff record'));
    fixture.detectChanges();

    expect(component.formGroup.value).toEqual({ search: 'staff record' });
  });

  describe('ellipsis', () => {
    const inputName = 'Provider name';
    const dataList = ['Coleman Training', 'First Response Training'];
    const overrides = {
      label: inputName,
      dataList,
    };

    it('should show when showEllipsis is true', async () => {
      const updatedOverrides = {
        ...overrides,
        showEllipsis: true,
      };

      const { getByRole, getAllByRole } = await setup(updatedOverrides);

      const input = getByRole('textbox', { name: inputName });

      expect(input).toHaveClass('overflow-ellipsis');

      dataList.forEach((item, index) => {
        const listItem = within(getAllByRole('listitem')[index]).getByText(item);
        expect(listItem).toHaveClass('tray-list-item');
      });
    });

    it('should not show when showEllipsis is false', async () => {
      const { getByRole, getAllByRole } = await setup({ ...overrides, showEllipsis: false });

      const input = getByRole('textbox', { name: inputName });

      expect(input).not.toHaveClass('overflow-ellipsis');

      dataList.forEach((item, index) => {
        const listItem = within(getAllByRole('listitem')[index]).getByText(item);
        expect(listItem).not.toHaveClass('tray-list-item');
      });
    });
  });
});
