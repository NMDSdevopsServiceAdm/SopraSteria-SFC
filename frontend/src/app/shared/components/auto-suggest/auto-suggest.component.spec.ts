import { render } from '@testing-library/angular';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { AutoSuggestComponent } from './auto-suggest.component';

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
    const { component, getByTestId } = await setup(override);
    expect(getByTestId('tray-list')).toBeTruthy;
  });
});
