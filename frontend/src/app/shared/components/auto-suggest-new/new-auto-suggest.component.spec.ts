import { render, within } from '@testing-library/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { NewAutoSuggestComponent } from './new-auto-suggest.component';
import userEvent from '@testing-library/user-event';
import { CdkListboxModule } from '@angular/cdk/listbox';

describe('NewAutoSuggestComponent', () => {
  async function setup(overrides: any = {}) {
    const jobs = ['Registered Nurse', 'Care worker', 'Care coordinator'];
    const mockDataProvider = (textInput: string) => {
      return jobs.filter((job) => job.toLowerCase().includes(textInput.toLowerCase()));
    };

    const componentProperties = {
      inputBoxId: overrides?.inputBoxId ?? 'auto-suggest',
      dataProvider: mockDataProvider,
      showEllipsis: overrides?.showEllipsis ?? false,
      hasError: false,
    };

    const setupTools = await render(NewAutoSuggestComponent, {
      imports: [ReactiveFormsModule, CdkListboxModule],
      providers: [],
      componentProperties: componentProperties,
    });
    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
    };
  }

  it('should create the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should use the given id for input element', async () => {
    const { getByRole } = await setup({ inputBoxId: 'job-role-search-box' });

    expect(getByRole('textbox').id).toEqual('job-role-search-box');
  });

  it('should show a tray of suggestions when user type in some text', async () => {
    const { getByTestId, getByRole } = await setup();

    userEvent.type(getByRole('textbox'), 'care');

    const tray = getByTestId('tray-list');

    expect(tray).toBeTruthy;

    expect(within(tray).queryByText('Care worker')).toBeTruthy();
    expect(within(tray).queryByText('Care coordinator')).toBeTruthy();
    expect(within(tray).queryByText('Registered nurse')).toBeFalsy();
  });

  it('should call emit input when user clicked one of the suggestions', async () => {
    const { component, getByTestId, getByRole } = await setup();
    const emitInputSpy = spyOn(component.emitInput, 'emit');

    const inputBox = getByRole('textbox') as HTMLInputElement;
    userEvent.type(inputBox, 'care');

    const tray = getByTestId('tray-list');
    userEvent.click(within(tray).getByText('Care worker'));

    expect(emitInputSpy).toHaveBeenCalledWith('Care worker');
    expect(inputBox.value).toEqual('Care worker');
  });

  it('should close the tray list when one of the suggestion was selected', async () => {
    const { queryByTestId, getByTestId, getByRole } = await setup();

    userEvent.type(getByRole('textbox'), 'care');
    const tray = getByTestId('tray-list');

    userEvent.click(within(tray).getByText('Care worker'));

    expect(queryByTestId('tray-list')).toBeFalsy();
  });

  describe('ellipsis', () => {
    it('should set the ellipsis css classes when showEllipsis is true', async () => {
      const { getByRole, getByText } = await setup({ showEllipsis: true });

      const input = getByRole('textbox');
      userEvent.type(input, 'care');

      expect(input).toHaveClass('overflow-ellipsis');
      expect(getByText('Care worker')).toHaveClass('tray-list-item');
    });

    it('should not set the ellipsis css classes when showEllipsis is false', async () => {
      const { getByRole, getByText } = await setup({ showEllipsis: true });

      const input = getByRole('textbox');
      userEvent.type(input, 'care');

      expect(input).toHaveClass('overflow-ellipsis');
      expect(getByText('Care worker')).toHaveClass('tray-list-item');
    });
  });
});
