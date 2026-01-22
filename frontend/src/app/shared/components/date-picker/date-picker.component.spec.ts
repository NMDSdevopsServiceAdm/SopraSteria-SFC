import { render } from '@testing-library/angular';
import { DatePickerComponent } from './date-picker.component';
import { SharedModule } from '@shared/shared.module';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import userEvent from '@testing-library/user-event';

describe('DatePickerComponent', () => {
  async function setup(overrides: any = {}) {
    const formGroupOptions = overrides?.formGroupOptions ?? {};
    const formBuilder = new FormBuilder();
    const inputForm: UntypedFormGroup = formBuilder.group(
      {
        date: formBuilder.group({
          day: [''],
          month: [''],
          year: [''],
        }),
      },
      formGroupOptions,
    );

    const setupTools = await render(DatePickerComponent, {
      imports: [SharedModule, ReactiveFormsModule, FormsModule, CommonModule],
      componentProperties: {
        formGroup: inputForm,
        formGroupName: 'date',
        submitted: false,
      },
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Input label', async () => {
    it('should show the day label', async () => {
      const { getByText } = await setup();
      expect(getByText('Day')).toBeTruthy();
    });

    it('should show the month label', async () => {
      const { getByText } = await setup();
      expect(getByText('Month')).toBeTruthy();
    });

    it('should show the year label', async () => {
      const { getByText } = await setup();
      expect(getByText('Year')).toBeTruthy();
    });
  });

  describe('Capture of data input', async () => {
    it('should show the correct form values', async () => {
      const { component, getByLabelText } = await setup();

      const dayInputBox = getByLabelText('Day');
      const monthInputBox = getByLabelText('Month');
      const yearInputBox = getByLabelText('Year');

      const day = '15';
      const month = '11';
      const year = '2025';

      userEvent.type(dayInputBox, day);
      userEvent.type(monthInputBox, month);
      userEvent.type(yearInputBox, year);

      expect(component.formGroup.value.date.day).toEqual(15);
      expect(component.formGroup.value.date.month).toEqual(11);
      expect(component.formGroup.value.date.year).toEqual(2025);
    });
  });

  describe('onChange EventEmitter', () => {
    it('should fire an onChange event on user input, regardless of the form control "updateOn" option', async () => {
      const { component, getByLabelText } = await setup({ formGroupOptions: { updateOn: 'submit' } });

      const onChangeSpy = spyOn(component.onChange, 'emit');

      const dayInputBox = getByLabelText('Day');
      const monthInputBox = getByLabelText('Month');
      const yearInputBox = getByLabelText('Year');

      userEvent.type(dayInputBox, '1');
      expect(onChangeSpy).toHaveBeenCalledWith({ day: 1, month: null, year: null });

      userEvent.type(monthInputBox, '2');
      expect(onChangeSpy).toHaveBeenCalledWith({ day: 1, month: 2, year: null });

      userEvent.type(yearInputBox, '2023');
      expect(onChangeSpy).toHaveBeenCalledWith({ day: 1, month: 2, year: 2023 });

      userEvent.clear(dayInputBox);
      expect(onChangeSpy).toHaveBeenCalledWith({ day: null, month: 2, year: 2023 });
    });
  });
});
