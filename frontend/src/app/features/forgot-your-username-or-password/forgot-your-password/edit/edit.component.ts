import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RequestPasswordResetResponse } from '@core/services/password-reset.service';

@Component({
    selector: 'app-fp-edit',
    templateUrl: './edit.component.html',
    standalone: false
})
export class ForgotYourPasswordEditComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;
  @Input() public serverError: string;
  @Output() formDataOutput = new EventEmitter<RequestPasswordResetResponse>();

  constructor(private formBuilder: UntypedFormBuilder, private errorSummaryService: ErrorSummaryService) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      usernameOrEmail: ['', { validators: [Validators.required, Validators.maxLength(120)], updateOn: 'submit' }],
    });

    this.setupFormErrorsMap();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'usernameOrEmail',
        type: [
          {
            name: 'required',
            message: 'Enter your username or ASC-WDS email address',
          },
          {
            name: 'maxlength',
            message: 'Your username or ASC-WDS email address must be 120 characters or fewer',
          },
        ],
      },
    ];
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  onSubmit() {
    const { usernameOrEmail } = this.form.controls;

    this.submitted = true;

    if (this.form.valid) {
      this.formDataOutput.emit(usernameOrEmail.value);
    }
  }
}
