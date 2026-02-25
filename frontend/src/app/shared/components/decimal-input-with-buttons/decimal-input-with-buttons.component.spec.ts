import { SharedModule } from '@shared/shared.module';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import lodash from 'lodash';

import { DecimalInputWithButtonsComponent } from './decimal-input-with-buttons.component';

describe('DecimalInputWithButtonsComponent', () => {
  const setup = async (override: any = {}) => {
    const inputPropertiesName = ['initialValue', 'min', 'max', 'inputId', 'suffix'];
    const inputProps = lodash.pickBy(override, (value, key) => {
      return value && inputPropertiesName.includes(key);
    });

    const setupTools = await render(DecimalInputWithButtonsComponent, {
      imports: [SharedModule],
      providers: [],
      componentProperties: inputProps,
    });

    const component = setupTools.fixture.componentInstance;
    const onChangeSpy = jasmine.createSpy();
    component.registerOnChange(onChangeSpy);

    return {
      ...setupTools,
      component,
      onChangeSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should show an input box', async () => {
      const { getByRole } = await setup();

      expect(getByRole('textbox')).toBeTruthy();
    });

    it('should show the input box as blank if no initial value given', async () => {
      const { getByRole } = await setup();

      const inputBox = getByRole('textbox') as HTMLInputElement;
      expect(inputBox.value).toEqual('');
    });

    it('should show the given initial value in the input box', async () => {
      const { getByRole } = await setup({ initialValue: 3.5 });

      const inputBox = getByRole('textbox') as HTMLInputElement;
      expect(inputBox.value).toEqual('3.5');
    });

    it('should show a plus sign and a minus sign button', async () => {
      const { getByTestId } = await setup({ initialValue: 3.5 });

      expect(getByTestId('plus-button-number-input')).toBeTruthy();
      expect(getByTestId('minus-button-number-input')).toBeTruthy();
    });

    it('should show a suffix if provided from input', async () => {
      const { getByText } = await setup({ suffix: '%' });

      expect(getByText('%')).toBeTruthy();
    });
  });

  fdescribe('behaviour', () => {
    describe('number input', async () => {
      it('should update the value and emit onChange event when entered a number', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup();
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;
        userEvent.type(inputBox, '3.5');

        expect(inputBox.value).toEqual('3.5');
        expect(onChangeSpy).toHaveBeenCalledWith(3.5);
      });

      it('should be able to register more than one onChange function', async () => {
        const { component, fixture, getByRole, onChangeSpy } = await setup();
        const anotherOnChangeSpy = jasmine.createSpy();
        component.registerOnChange(anotherOnChangeSpy);

        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;
        userEvent.type(inputBox, '3.5');

        expect(onChangeSpy).toHaveBeenCalledWith(3.5);
        expect(anotherOnChangeSpy).toHaveBeenCalledWith(3.5);
      });

      it('should emit onChange event with empty string when the input box is cleared', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup();
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;
        userEvent.type(inputBox, '10');
        userEvent.clear(inputBox);

        expect(onChangeSpy).toHaveBeenCalledWith(10);
        expect(onChangeSpy).toHaveBeenCalledWith('');
      });
    });

    describe('plus button', async () => {
      it('should increase the value by 0.5 on every click', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup();
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;

        userEvent.type(inputBox, '10');

        await clickPlusButton();
        expect(inputBox.value).toEqual('10.5');
        expect(onChangeSpy).toHaveBeenCalledWith(10.5);

        await clickPlusButton();
        expect(inputBox.value).toEqual('11');
        expect(onChangeSpy).toHaveBeenCalledWith(11);

        await clickPlusButton();
        expect(inputBox.value).toEqual('11.5');
        expect(onChangeSpy).toHaveBeenCalledWith(11.5);
      });

      it('should set the value to minimum if the current value is lower then minium', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup({ min: 3.5 });
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;

        userEvent.type(inputBox, '1');
        await clickPlusButton();

        expect(inputBox.value).toEqual('3.5');
        expect(onChangeSpy).toHaveBeenCalledWith(3.5);
      });

      it('should set the value to minimum if the current value is not a valid number', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup({ min: 3.5 });
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;

        userEvent.type(inputBox, 'apple banana orange');
        await clickPlusButton();

        expect(inputBox.value).toEqual('3.5');
        expect(onChangeSpy).toHaveBeenCalledWith(3.5);
      });

      it('should not show the plus button when value reached maximum', async () => {
        const { fixture, getByRole, queryByTestId } = await setup({ max: 10 });
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;
        expect(queryByTestId('plus-button-number-input')).toBeTruthy();

        userEvent.type(inputBox, '10');

        expect(queryByTestId('plus-button-number-input')).toBeFalsy();
      });
    });

    describe('minus button', async () => {
      it('should decrease the value by 0.5 on every click', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup();
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;

        userEvent.type(inputBox, '10');

        await clickMinusButton();
        expect(inputBox.value).toEqual('9.5');
        expect(onChangeSpy).toHaveBeenCalledWith(9.5);

        await clickMinusButton();
        expect(inputBox.value).toEqual('9');
        expect(onChangeSpy).toHaveBeenCalledWith(9);

        await clickMinusButton();
        expect(inputBox.value).toEqual('8.5');
        expect(onChangeSpy).toHaveBeenCalledWith(8.5);
      });

      it('should set the value to maximum if the current value is higher then maximum', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup({ max: 999 });
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;

        userEvent.type(inputBox, '10000');
        await clickMinusButton();

        expect(inputBox.value).toEqual('999');
        expect(onChangeSpy).toHaveBeenCalledWith(999);
      });
    });

    const clickPlusButton = async () => {
      screen.getByTestId('plus-button-number-input').click();
    };

    const clickMinusButton = async () => {
      screen.getByTestId('minus-button-number-input').click();
    };
  });
});
