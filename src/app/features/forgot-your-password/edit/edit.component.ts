import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RequestPasswordResetResponse } from '@core/services/password-reset.service';

@Component({
  selector: 'app-fp-edit',
  templateUrl: './edit.component.html',
})
export class ForgotYourPasswordEditComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl', { static: false }) formEl: ElementRef;
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
