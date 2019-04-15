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

  static checkMultipleInputValues(c: AbstractControl): { [key: string]: boolean } | null {
    const regulatedPostcode = c.get('regulatedPostcode');
    const locationId = c.get('locationId');

    if (regulatedPostcode.value.length && locationId.value.length) {
      return { bothHaveContent: true };
    } else if (!regulatedPostcode.value.length && !locationId.value.length) {
      return { bothAreEmpty: true };
    }
  }

  static matchInputValues(c: AbstractControl): null | void {
    const passwordControl = c.get('createPasswordInput');
    const confirmPasswordControl = c.get('confirmPasswordInput');

    if (passwordControl.pristine || confirmPasswordControl.pristine) {
      return null;
    }

    if (passwordControl.value !== confirmPasswordControl.value) {
      return confirmPasswordControl.setErrors({ notMatched: true });
    }
  }
}
