import { SharedModule } from '@shared/shared.module';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import lodash from 'lodash';

import { NumberInputWithButtonsComponent } from './number-input-with-buttons.component';

describe('NumberInputWithButtonsComponent', () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const setup = async (override: any = {}) => {
    const inputPropertiesName = ['initialValue', 'min', 'max', 'inputId'];
    const inputProps = lodash.pickBy(override, (value, key) => {
      return value && inputPropertiesName.includes(key);
    });

    const setupTools = await render(NumberInputWithButtonsComponent, {
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
      const { getByRole } = await setup({ initialValue: 10 });

      const inputBox = getByRole('textbox') as HTMLInputElement;
      expect(inputBox.value).toEqual('10');
    });

    it('should assign the given inputId as the id of input box', async () => {
      const { getByRole } = await setup({ inputId: 'number-of-staff' });

      const inputBox = getByRole('textbox') as HTMLInputElement;
      expect(inputBox.id).toEqual('number-of-staff');
    });

    it('should show a plus sign and a minus sign button', async () => {
      const { getByTestId } = await setup({ initialValue: 10 });

      expect(getByTestId('plus-button-number-input')).toBeTruthy();
      expect(getByTestId('minus-button-number-input')).toBeTruthy();
    });
  });

  describe('behaviour', () => {
    describe('number input', async () => {
      it('should update the value and emit onChange event when entered a number', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup();
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;
        userEvent.type(inputBox, '10');

        expect(inputBox.value).toEqual('10');
        expect(onChangeSpy).toHaveBeenCalledWith(10);
      });

      it('should be able to register more than one onChange function', async () => {
        const { component, fixture, getByRole, onChangeSpy } = await setup();
        const anotherOnChangeSpy = jasmine.createSpy();
        component.registerOnChange(anotherOnChangeSpy);

        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;
        userEvent.type(inputBox, '10');

        expect(onChangeSpy).toHaveBeenCalledWith(10);
        expect(anotherOnChangeSpy).toHaveBeenCalledWith(10);
      });

      it('should emit onChange event with the input string if the input is not a valid number', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup();
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;
        userEvent.type(inputBox, 'a1b2c3');

        expect(onChangeSpy).toHaveBeenCalledWith('a1b2c3');
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
      it('should set the value to 1 (default min value) when clicked, if the input box is empty', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup();
        fixture.autoDetectChanges();

        await clickPlusButton();

        const inputBox = getByRole('textbox') as HTMLInputElement;
        expect(inputBox.value).toEqual('1');
        expect(onChangeSpy).toHaveBeenCalledOnceWith(1);
      });

      it('should increase the value by 1 on every click', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup();
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;

        userEvent.type(inputBox, '10');

        await clickPlusButton();
        expect(inputBox.value).toEqual('11');
        expect(onChangeSpy).toHaveBeenCalledWith(11);

        await clickPlusButton();
        expect(inputBox.value).toEqual('12');
        expect(onChangeSpy).toHaveBeenCalledWith(12);

        await clickPlusButton();
        expect(inputBox.value).toEqual('13');
        expect(onChangeSpy).toHaveBeenCalledWith(13);
      });

      it('should set the value to minimum if the current value is lower then minium', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup({ min: 1 });
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;

        userEvent.type(inputBox, '-10');
        await clickPlusButton();

        expect(inputBox.value).toEqual('1');
        expect(onChangeSpy).toHaveBeenCalledWith(1);
      });

      it('should set the value to minimum if the current value is not a valid number', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup({ min: 1 });
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;

        userEvent.type(inputBox, 'apple banana orange');
        await clickPlusButton();

        expect(inputBox.value).toEqual('1');
        expect(onChangeSpy).toHaveBeenCalledWith(1);
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
      it('should decrease the value by 1 on every click', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup();
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;

        userEvent.type(inputBox, '10');

        await clickMinusButton();
        expect(inputBox.value).toEqual('9');
        expect(onChangeSpy).toHaveBeenCalledWith(9);

        await clickMinusButton();
        expect(inputBox.value).toEqual('8');
        expect(onChangeSpy).toHaveBeenCalledWith(8);

        await clickMinusButton();
        expect(inputBox.value).toEqual('7');
        expect(onChangeSpy).toHaveBeenCalledWith(7);
      });

      it('should hide the minus button when value reached minimum', async () => {
        const { fixture, getByRole, queryByTestId } = await setup({ min: 1 });
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;

        userEvent.type(inputBox, '2');
        expect(queryByTestId('minus-button-number-input')).toBeTruthy();

        await clickMinusButton();

        expect(queryByTestId('minus-button-number-input')).toBeFalsy();
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

      it('should not show the minus button when input box is empty', async () => {
        const { fixture, getByRole, queryByTestId } = await setup();
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox') as HTMLInputElement;
        expect(queryByTestId('minus-button-number-input')).toBeFalsy();

        userEvent.type(inputBox, '10');
        expect(queryByTestId('minus-button-number-input')).toBeTruthy();

        userEvent.clear(inputBox);
        expect(queryByTestId('minus-button-number-input')).toBeFalsy();
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
