import { SharedModule } from '@shared/shared.module';
import { NumberInputComponent } from './number-input.component';
import { render, screen } from '@testing-library/angular';
import * as lodash from 'lodash';

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

    return {
      ...setupTools,
      component,
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
      const { getByTestId } = await setup({ labelText: 'Number of staff' });

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

    describe('when input box is empty', async () => {
      it('should set the value to 1 (default min value) when plus button is clicked', async () => {
        const { fixture, getByRole } = await setup({ labelText: 'Number of staff' });
        fixture.autoDetectChanges();

        await clickPlusButton();

        const inputBox = getByRole('textbox', { name: 'Number of staff' }) as HTMLInputElement;
        expect(inputBox.value).toEqual('1');
      });

      it('should set the value to 1 (default min value) when minus button is clicked', async () => {
        const { fixture, getByRole } = await setup({ labelText: 'Number of staff' });
        fixture.autoDetectChanges();

        await clickMinusButton();

        const inputBox = getByRole('textbox', { name: 'Number of staff' }) as HTMLInputElement;
        expect(inputBox.value).toEqual('1');
      });
    });
  });
});
