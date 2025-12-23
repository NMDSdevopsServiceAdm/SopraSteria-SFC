import { render, within } from '@testing-library/angular';
import { ExternalTrainingProviderInputComponent } from './external-training-provider-input.component';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { TrainingProvider } from '@core/model/training-provider.model';
import userEvent from '@testing-library/user-event';
import { AutoSuggestComponent } from '../auto-suggest/auto-suggest.component';

describe('ExternalTrainingProviderInputComponent', () => {
  const formBuilder = new UntypedFormBuilder();
  const mockTrainingProviders = [
    { id: 1, name: '1Stop Training', isOther: false },
    { id: 2, name: 'AASOG Education and Training', isOther: false },
    { id: 63, name: 'other', isOther: true },
  ] as TrainingProvider[];

  const setup = async (overrides: any = {}) => {
    const setupTools = await render(ExternalTrainingProviderInputComponent, {
      imports: [CommonModule, SharedModule, ReactiveFormsModule],
      declarations: [AutoSuggestComponent],
      providers: [],
      componentProperties: {
        form: formBuilder.group({ externalProviderName: null }),
        trainingProviders: mockTrainingProviders,
        ...overrides,
      },
    });

    return {
      component: setupTools.fixture.componentInstance,
      ...setupTools,
    };
  };

  it('should render a ExternalTrainingProviderInputComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show a text input for provider name if hideInput is false', async () => {
    const { getByTestId } = await setup({ hideInput: false });

    const providerName = getByTestId('conditional-external-provider-name');

    expect(within(providerName).getByRole('textbox', { name: 'Provider name' })).toBeTruthy();
    expect(providerName).not.toHaveClass('govuk-radios__conditional--hidden');
  });

  it('should not show a text input for provider name if hideInput is false', async () => {
    const { getByTestId } = await setup({ hideInput: true });

    const providerName = getByTestId('conditional-external-provider-name');

    expect(providerName).toHaveClass('govuk-radios__conditional--hidden');
  });

  it('should remove the suggested tray on click of the matching provider name', async () => {
    const { queryByTestId, getByTestId, fixture } = await setup();

    const providerName = getByTestId('conditional-external-provider-name');

    userEvent.type(within(providerName).getByRole('textbox', { name: 'Provider name' }), 'training');
    fixture.detectChanges();

    const getTrayList = getByTestId('tray-list');

    expect(getTrayList).toBeTruthy();

    userEvent.click(within(getTrayList).getByText(mockTrainingProviders[0].name));
    fixture.detectChanges();

    const queryTrayList = queryByTestId('tray-list');
    expect(queryTrayList).toBeFalsy();
  });

  it('should prefill the input with the selected training provider', async () => {
    const { getByLabelText } = await setup({
      form: formBuilder.group({ externalProviderName: mockTrainingProviders[0].name }),
    });

    const label = getByLabelText('Provider name') as HTMLInputElement;
    expect(label.value).toEqual(mockTrainingProviders[0].name);
  });
});
