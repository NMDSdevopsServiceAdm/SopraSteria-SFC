import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-total-staff',
  templateUrl: './total-staff.component.html',
})
export class TotalStaffComponent implements OnInit, OnDestroy {
  @Input() establishmentUid: string;

  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  private totalStaffConstraints = { min: 0, max: 999 };
  private subscriptions: Subscription = new Subscription();

  constructor(
    public formBuilder: FormBuilder, 
    public errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
  ) {
    this.form = this.formBuilder.group({
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

  ngOnInit() {
    this.subscriptions.add(
      this.establishmentService.getStaff(this.establishmentUid).subscribe(staff => {
        this.form.patchValue({ totalStaff: staff });
      })
    );
    this.setupFormErrors();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private nonIntegerValidator(nameRe: RegExp): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const forbidden = nameRe.test(control.value);
      return forbidden ? {'nonInteger': {value: control.value}} : null;
    };
  }

  private setupFormErrors(): void {
    this.formErrorsMap = [
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
