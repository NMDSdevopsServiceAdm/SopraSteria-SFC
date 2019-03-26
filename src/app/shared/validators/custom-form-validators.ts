import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';

export class CustomValidators extends Validators {
  static maxWords(limit: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: { limit: number; actual: number } } | null => {
      const actual: number = ((control.value || '').match(/\S+/g) || []).length;
      if (actual > limit) {
        return { maxwords: { limit, actual } };
      }
      return null;
    };
  }

  // create a static method for your validation
  static multipleValuesValidator(c: AbstractControl): { [key: string]: boolean } | null {
    const postcodeControl = c.get('cqcRegisteredPostcode');
    const locationIdControl = c.get('locationId');

    if (postcodeControl.pristine || locationIdControl.pristine) {
      return null;
    }

    if (postcodeControl.value.length < 1 && locationIdControl.value.length < 1) {
      return null;
    }

    if (
      (postcodeControl.value.length < 1 && locationIdControl.value.length > 0) ||
      (postcodeControl.value.length > 0 && locationIdControl.value.length < 1)
    ) {
      return null;
    }
    return { bothHaveContent: true };
  }

  static matchInputValues(c: AbstractControl): { [key: string]: boolean } | null {
    const passwordControl = c.get('createPasswordInput');
    const confirmPasswordControl = c.get('confirmPasswordInput');

    if (passwordControl.pristine || confirmPasswordControl.pristine) {
      return null;
    }

    if (passwordControl.value !== confirmPasswordControl.value) {
      return { notMatched: true };
    }
  }
}
