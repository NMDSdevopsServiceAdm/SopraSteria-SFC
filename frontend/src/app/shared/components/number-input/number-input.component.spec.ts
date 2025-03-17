import lodash from 'lodash';

import { SharedModule } from '@shared/shared.module';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { NumberInputComponent } from './number-input.component';

fdescribe('NumberInputComponent', () => {
  const setup = async (override: any = {}) => {
    const inputPropertiesName = ['initialValue', 'min', 'max', 'labelText', 'id'];
    const inputProps = lodash.pickBy(override, (value, key) => {
      return value && inputPropertiesName.includes(key);
    });

    const setupTools = await render(NumberInputComponent, {
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
    it('should show the provided label text', async () => {
      const { getByText } = await setup({ labelText: 'Number of staff' });

      expect(getByText('Number of staff')).toBeTruthy();
    });

    it('should show a number input', async () => {
      const { getByRole } = await setup({ labelText: 'Number of staff' });

      expect(getByRole('textbox', { name: 'Number of staff' })).toBeTruthy();
    });

    it('should show the number input as blank if no initial value given', async () => {
      const { getByRole } = await setup({ labelText: 'Number of staff' });

      const inputBox = getByRole('textbox', { name: 'Number of staff' }) as HTMLInputElement;
      expect(inputBox.value).toEqual('');
    });

    it('should show the given initial value in the number input box', async () => {
      const { getByRole } = await setup({ labelText: 'Number of staff', initialValue: 10 });

      const inputBox = getByRole('textbox', { name: 'Number of staff' }) as HTMLInputElement;
      expect(inputBox.value).toEqual('10');
    });

    it('should show a plus sign and a minus sign button', async () => {
      const { getByTestId } = await setup({ labelText: 'Number of staff', initialValue: 10 });

      expect(getByTestId('plus-sign-button')).toBeTruthy();
      expect(getByTestId('minus-sign-button')).toBeTruthy();
    });
  });

  describe('behaviour', () => {
    const clickPlusButton = async () => {
      screen.getByTestId('plus-sign-button').click();
    };

    const clickMinusButton = async () => {
      screen.getByTestId('minus-sign-button').click();
    };

    describe('number input', async () => {
      it('should update the value and emit onChange event when entered a number', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup({ labelText: 'Number of staff' });
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox', { name: 'Number of staff' }) as HTMLInputElement;
        userEvent.type(inputBox, '10');

        expect(inputBox.value).toEqual('10');
        expect(onChangeSpy).toHaveBeenCalledWith(10);
      });

      it('should emit onChange event with null when the input is not a valid number', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup({ labelText: 'Number of staff' });
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox', { name: 'Number of staff' }) as HTMLInputElement;
        userEvent.type(inputBox, 'a1b2c3');

        expect(onChangeSpy).toHaveBeenCalledWith(null);
      });

      it('should emit onChange event with null when the input box is cleared', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup({ labelText: 'Number of staff' });
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox', { name: 'Number of staff' }) as HTMLInputElement;
        userEvent.type(inputBox, '10');
        userEvent.clear(inputBox);

        expect(onChangeSpy).toHaveBeenCalledWith(10);
        expect(onChangeSpy).toHaveBeenCalledWith(null);
      });
    });

    describe('plus button', async () => {
      it('should set the value to 1 (default min value) when clicked, if the input box is empty', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup({ labelText: 'Number of staff' });
        fixture.autoDetectChanges();

        await clickPlusButton();

        const inputBox = getByRole('textbox', { name: 'Number of staff' }) as HTMLInputElement;
        expect(inputBox.value).toEqual('1');
        expect(onChangeSpy).toHaveBeenCalledOnceWith(1);
      });

      it('should increase the value by 1 on every click', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup({ labelText: 'Number of staff' });
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox', { name: 'Number of staff' }) as HTMLInputElement;

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

      it('should not show the plus button when value reached maximum', async () => {
        const { fixture, getByRole, queryByTestId } = await setup({ labelText: 'Number of staff', max: 10 });
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox', { name: 'Number of staff' }) as HTMLInputElement;
        expect(queryByTestId('plus-sign-button')).toBeTruthy();

        userEvent.type(inputBox, '10');

        expect(queryByTestId('plus-sign-button')).toBeFalsy();
      });
    });

    describe('minus button', async () => {
      it('should decrease the value by 1 on every click', async () => {
        const { fixture, getByRole, onChangeSpy } = await setup({ labelText: 'Number of staff' });
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox', { name: 'Number of staff' }) as HTMLInputElement;

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
        const { fixture, getByRole, queryByTestId } = await setup({ labelText: 'Number of staff', min: 1 });
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox', { name: 'Number of staff' }) as HTMLInputElement;

        userEvent.type(inputBox, '2');
        expect(queryByTestId('plus-sign-button')).toBeTruthy();

        await clickMinusButton();

        expect(queryByTestId('minus-sign-button')).toBeFalsy();
      });

      it('should not show the minus button when input box is empty', async () => {
        const { fixture, getByRole, queryByTestId } = await setup({ labelText: 'Number of staff' });
        fixture.autoDetectChanges();

        const inputBox = getByRole('textbox', { name: 'Number of staff' }) as HTMLInputElement;
        expect(queryByTestId('minus-sign-button')).toBeFalsy();

        userEvent.type(inputBox, '10');
        expect(queryByTestId('minus-sign-button')).toBeTruthy();

        userEvent.clear(inputBox);
        expect(queryByTestId('minus-sign-button')).toBeFalsy();
      });
    });
  });
});
