import { Injectable } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';

import { EstablishmentService } from './establishment.service';

export const TotalStaffConstraints = { min: 0, max: 999 };

@Injectable({
  providedIn: 'root',
})
export class TotalStaffFormService {
  public isParent: boolean;
  public workplace: Establishment;
  public maxTotalStaff: number = TotalStaffConstraints.max;

  constructor(public establishmentService: EstablishmentService) {}

  public createForm(
    formBuilder: UntypedFormBuilder,
    options: CreateFormOptions = { updateOnSubmit: false, overrideUpperLimit: false },
  ): UntypedFormGroup {
    const updateOnSubmit = options?.updateOnSubmit ?? false;
    const overrideUpperLimit = options?.overrideUpperLimit ?? false;

    this.workplace = this.establishmentService.primaryWorkplace;
    this.isParent = this.workplace?.isParent;

    this.maxTotalStaff = overrideUpperLimit ? 9999999 : TotalStaffConstraints.max;

    return formBuilder.group(
      {
        totalStaff: [
          null,
          [
            Validators.required,
            this.nonIntegerValidator(new RegExp('d*[.]d*')),
            Validators.min(TotalStaffConstraints.min),
            Validators.max(this.maxTotalStaff),
            Validators.pattern('^[0-9]+$'),
          ],
        ],
      },
      updateOnSubmit ? { updateOn: 'submit' } : {},
    );
  }

  private nonIntegerValidator(nameRe: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
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
            message: `Number of staff must be a whole number between  ${TotalStaffConstraints.min} and ${this.maxTotalStaff}`,
          },
          {
            name: 'min',
            message: `Number of staff must be a whole number between  ${TotalStaffConstraints.min} and ${this.maxTotalStaff}`,
          },
          {
            name: 'max',
            message: `Number of staff must be a whole number between  ${TotalStaffConstraints.min} and ${this.maxTotalStaff}`,
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

interface CreateFormOptions {
  updateOnSubmit?: boolean;
  overrideUpperLimit?: boolean;
}
