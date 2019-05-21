import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FILE_UPLOAD_TYPES } from '@core/constants/constants';

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

  static checkFiles(fileUpload, files: Array<File>): ValidatorFn {
    const errors: ValidationErrors = {};
    const maxFileSize = 20971520;

    if (files.length !== 3) {
      errors['filecount'] = true;
    }

    files.forEach((file: File) => {
      if (file.size > maxFileSize) {
        errors['filesize'] = true;
        return;
      }
    });

    files.forEach((file: File) => {
      if (!FILE_UPLOAD_TYPES.includes(file.type)) {
        errors['filetype'] = true;
        return;
      }
    });

    if (Object.keys(errors).length) {
      return fileUpload.setErrors(errors);
    }

    return null;
  }
}
