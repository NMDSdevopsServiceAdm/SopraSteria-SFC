import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FILE_UPLOAD_TYPES } from '@core/constants/constants';
import { jobOptionsEnum } from '@core/model/establishment.model';

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

  static bothControlsHaveValues(group: AbstractControl): { [key: string]: boolean } | null {
    const errors: ValidationErrors = {};
    const control1Name: string = Object.keys(group[`controls`])[0];
    const control2Name: string = Object.keys(group[`controls`])[1];
    const control1: AbstractControl = group.get(control1Name);
    const control2: AbstractControl = group.get(control2Name);

    if (!control1.value && !control2.value) {
      return { bothAreEmpty: true };
    } else {
      if (!control1.value && control2.value) {
        errors[`${control1Name}Empty`] = true;
        return errors;
      } else if (control1.value && !control2.value) {
        errors[`${control2Name}Empty`] = true;
        return errors;
      }
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

  static checkFiles(c: AbstractControl): { [key: string]: boolean } | null {
    const errors: ValidationErrors = {};
    const maxFileSize = 20971520;

    if (c.value == null || c.value.length === 0) {
      return null;
    }

    const files = Array.from(c.value);

    if (files.length < 2 || files.length > 3) {
      errors[`filecount`] = true;
    }

    files.forEach((file: File) => {
      if (file.size > maxFileSize) {
        errors[`filesize`] = true;
        return;
      }
    });

    files.forEach((file: File) => {
      const parts: Array<string> = file.name.split('.');
      const fileExtension: string = parts[parts.length - 1].toUpperCase();

      if (!FILE_UPLOAD_TYPES.includes(fileExtension)) {
        errors[`filetype`] = true;
        return;
      }
    });

    if (Object.keys(errors).length) {
      c.setErrors(errors);
      return errors;
    }

    return null;
  }

  static checkBulkUploadFiles(c: AbstractControl): { [key: string]: boolean } | null {
    const errors: ValidationErrors = {};
    const maxFileSize = 20971520;

    if (c.value == null || c.value.length === 0) {
      return null;
    }

    const files = Array.from(c.value);

    files.forEach((file: File) => {
      if (file.size > maxFileSize) {
        errors[`filesize`] = true;
        return;
      }
    });

    files.forEach((file: File) => {
      const parts: Array<string> = file.name.split('.');
      const fileExtension: string = parts[parts.length - 1].toUpperCase();

      if (fileExtension !== 'CSV') {
        errors[`csvfiletype`] = true;
        return;
      }
    });

    if (Object.keys(errors).length) {
      c.setErrors(errors);
      return errors;
    }

    return null;
  }

  static validateUploadCertificates(files: File[]): string[] | null {
    const errors = [];
    const maxFileSize = 5 * 1024 * 1024;

    if (files.some((file) => !file.name.toLowerCase().endsWith('.pdf'))) {
      errors.push('The certificate must be a PDF file');
    }

    if (files.some((file) => file.size > maxFileSize)) {
      errors.push('The certificate must be no larger than 5MB');
    }

    return errors.length ? errors : null;
  }

  static validateArrayNotEmpty(): ValidatorFn {
    const validatorFunction = (formControl: AbstractControl) => {
      if (formControl.value?.length > 0) {
        return null;
      } else {
        return { selectedNone: true };
      }
    };

    return validatorFunction;
  }

  static crossCheckJobRoleOptions(): ValidatorFn {
    const validatorFunction = (rootFormControl: AbstractControl) => {
      const jobRoleNumbers: AbstractControl<Array<number | string>> = rootFormControl.get('jobRoleNumbers');
      const noOrDoNotKnow: AbstractControl<jobOptionsEnum> = rootFormControl.get('noOrDoNotKnow');

      jobRoleNumbers.setErrors(null);
      noOrDoNotKnow.setErrors(null);

      const userSelectedNoOrDoNotKnow = [jobOptionsEnum.DONT_KNOW, jobOptionsEnum.NONE].includes(noOrDoNotKnow.value);
      if (userSelectedNoOrDoNotKnow) {
        return null;
      }

      const noJobRolesAdded = !jobRoleNumbers.value || jobRoleNumbers.value?.length === 0;

      if (noJobRolesAdded) {
        jobRoleNumbers.setErrors({ required: true });
        noOrDoNotKnow.setErrors({ required: true });
        return null;
      }

      const jobRoleNumberIsInvalid = (jobRoleNumber: number | string) => {
        const parsedNumber = Number(jobRoleNumber);
        return !Number.isInteger(parsedNumber) || parsedNumber <= 0;
      };

      const allJobRoleNumbersAreInvalid = jobRoleNumbers.value.every(jobRoleNumberIsInvalid);

      if (allJobRoleNumbersAreInvalid) {
        noOrDoNotKnow.setErrors({ required: true });
        return null;
      }
    };
    return validatorFunction;
  }

  static crossCheckTrainingCourseValidityPeriod(): ValidatorFn {
    const validatorFunction = (rootFormControl: AbstractControl) => {
      const validityPeriodInMonth: AbstractControl<number> = rootFormControl.get('validityPeriodInMonth');
      const doesNotExpire: AbstractControl<boolean> = rootFormControl.get('doesNotExpire');

      const choseDoesNotExpire = doesNotExpire.value === true;
      const enteredAValidNumber = Number(validityPeriodInMonth.value) > 0;

      if (!choseDoesNotExpire && !enteredAValidNumber) {
        validityPeriodInMonth.setErrors({ requireEitherOne: true });
        return null;
      }
    };

    return validatorFunction;
  }
}
