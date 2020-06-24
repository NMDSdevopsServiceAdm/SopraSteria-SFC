import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';


@Injectable({
  providedIn: 'root',
})
export class TotalStaffFormService {
  private totalStaffConstraints = { min: 0, max: 999 };

  constructor() {}

  public createForm(formBuilder: FormBuilder): FormGroup {
    return formBuilder.group({
      totalStaff: [
        null,
        [
          Validators.required,
          this.nonIntegerValidator(new RegExp('\d*[.]\d*')),
          Validators.min(this.totalStaffConstraints.min),
          Validators.max(this.totalStaffConstraints.max),
          Validators.pattern('^[0-9]+$')
        ],
      ],
    });
  }

  private nonIntegerValidator(nameRe: RegExp): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const forbidden = nameRe.test(control.value);
      return forbidden ? {'nonInteger': {value: control.value}} : null;
    };
  }

  public createFormErrorsMap(): Array<ErrorDetails> {
    return [
      {
        item: 'totalStaff',
        type: [
          {
            name: 'required',
            message: 'Enter the total number of staff at your workplace',
          },
          {
            name: 'nonInteger',
            message: `Total number of staff must be a whole number between ${this.totalStaffConstraints.min} and ${this.totalStaffConstraints.max}`,
          },
          {
            name: 'min',
            message: `Total number of staff must be a whole number between ${this.totalStaffConstraints.min} and ${this.totalStaffConstraints.max}`,
          },
          {
            name: 'max',
            message: `Total number of staff must be a whole number between ${this.totalStaffConstraints.min} and ${this.totalStaffConstraints.max}`,
          },
          {
            name: 'pattern',
            message: 'Enter the total number of staff as a digit, like 7',
          },
        ],
      },
    ];
  }
}
