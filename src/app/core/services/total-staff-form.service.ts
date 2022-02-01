import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';

import { EstablishmentService } from './establishment.service';

@Injectable({
  providedIn: 'root',
})
export class TotalStaffFormService {
  private totalStaffConstraints = { min: 0, max: 999 };
  public isParent: boolean;
  public workplace: Establishment;

  constructor(public establishmentService: EstablishmentService) {}

  public createForm(formBuilder: FormBuilder): FormGroup {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.isParent = this.workplace?.isParent;

    return formBuilder.group({
      totalStaff: [
        null,
        [
          Validators.required,
          this.nonIntegerValidator(new RegExp('d*[.]d*')),
          Validators.min(this.totalStaffConstraints.min),
          Validators.max(this.totalStaffConstraints.max),
          Validators.pattern('^[0-9]+$'),
        ],
      ],
    });
  }

  private nonIntegerValidator(nameRe: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const forbidden = nameRe.test(control.value);
      return forbidden ? { nonInteger: { value: control.value } } : null;
    };
  }

  public createFormErrorsMap(): Array<ErrorDetails> {
    return [
      {
        item: 'totalStaff',
        type: [
          {
            name: 'required',
            message: `Enter how many members of staff ${this.isParent ? 'the' : 'your'} workplace has`,
          },
          {
            name: 'nonInteger',
            message: `Number of staff must be a whole number between  ${this.totalStaffConstraints.min} and ${this.totalStaffConstraints.max}`,
          },
          {
            name: 'min',
            message: `Number of staff must be a whole number between  ${this.totalStaffConstraints.min} and ${this.totalStaffConstraints.max}`,
          },
          {
            name: 'max',
            message: `Number of staff must be a whole number between  ${this.totalStaffConstraints.min} and ${this.totalStaffConstraints.max}`,
          },
          {
            name: 'pattern',
            message: 'Enter the number of staff as a digit, like 7',
          },
        ],
      },
    ];
  }
}
