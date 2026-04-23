import { FormControl, Validators } from '@angular/forms';
import { CustomValidators } from './custom-form-validators';
import { signal } from '@angular/core';

describe('CustomValidators', () => {
  describe('alias', () => {
    it('should map the output error type of a validator to another name', async () => {
      const validator = CustomValidators.alias(Validators.min(10), 'specialErrorType');

      const formControl = new FormControl<number>(0, { validators: [validator] });

      formControl.setValue(0);
      expect(formControl.errors).toEqual({ specialErrorType: true });

      formControl.setValue(11);
      expect(formControl.errors).toEqual(null);
    });
  });

  describe('withSignalToggle', () => {
    it('should take a validatorFn and boolean signal, and return a validatorFn that only run when the signal is on', async () => {
      const validatorIsActive = signal<boolean>(null);
      const validatorWithSpy = jasmine.createSpy('validator', Validators.min(10)).and.callThrough();

      const wrappedValidator = CustomValidators.withSignalToggle(validatorWithSpy, validatorIsActive);

      const formControl = new FormControl<number>(0, { validators: [wrappedValidator] });

      validatorIsActive.set(false);

      formControl.setValue(0);
      expect(formControl.errors).toEqual(null);
      expect(validatorWithSpy).not.toHaveBeenCalled();

      validatorIsActive.set(true);

      formControl.setValue(0);
      expect(formControl.errors).toEqual({ min: { min: 10, actual: 0 } });
      expect(validatorWithSpy).toHaveBeenCalledOnceWith(formControl);

      formControl.setValue(11);
      expect(formControl.errors).toEqual(null);
      expect(validatorWithSpy).toHaveBeenCalledTimes(2);
    });

    it('the wrapped validatorFn should not clear existing error when signal is off', async () => {
      const validatorIsActive = signal<boolean>(null);
      const wrappedValidator = CustomValidators.withSignalToggle(Validators.min(10), validatorIsActive);

      const formControl = new FormControl<number>(0, { validators: [wrappedValidator] });

      validatorIsActive.set(true);

      formControl.setValue(0);
      expect(formControl.errors).toEqual({ min: { min: 10, actual: 0 } });

      validatorIsActive.set(false);

      formControl.setValue(11);
      expect(formControl.errors).toEqual({ min: { min: 10, actual: 0 } });
    });
  });
});
