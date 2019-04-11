import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestPasswordResetResponse } from '@core/services/password-reset.service';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';

@Component({
  selector: 'app-fp-edit',
  templateUrl: './edit.component.html',
})
export class ForgotYourPasswordEditComponent implements OnInit {
  public form: FormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;
  @Input() public serverError: string;
  @Output() formDataOutput = new EventEmitter<RequestPasswordResetResponse>();

  constructor(private formBuilder: FormBuilder, private errorSummaryService: ErrorSummaryService) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      usernameOrEmail: ['', [Validators.required, Validators.maxLength(120)]],
    });

    this.setupFormErrorsMap();
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'usernameOrEmail',
        type: [
          {
            name: 'required',
            message: 'Please enter your username or email address.',
          },
        ],
      },
    ];
  }

  /**
   * Pass in formGroup or formControl name and errorType
   * Then return error message
   * @param item
   * @param errorType
   */
  public getFormErrorMessage(item: string, errorType: string): string {
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
