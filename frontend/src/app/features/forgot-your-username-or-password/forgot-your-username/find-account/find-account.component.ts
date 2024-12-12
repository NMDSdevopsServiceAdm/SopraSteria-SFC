import { lowerFirst } from 'lodash';
import { Subscription } from 'rxjs';

import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { EMAIL_PATTERN } from '@core/constants/constants';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { AccountFound, FindUserAccountResponse, FindUsernameService } from '@core/services/find-username.service';

const InputFields = [
  { id: 'name', label: 'Name', maxlength: 120 },
  { id: 'workplaceIdOrPostcode', label: 'Workplace ID or postcode', maxlength: 8 },
  { id: 'email', label: 'Email address', maxlength: 120, pattern: EMAIL_PATTERN },
];

@Component({
  selector: 'app-find-account',
  templateUrl: './find-account.component.html',
})
export class FindAccountComponent {
  @ViewChild('formEl') formEl: ElementRef;
  @ViewChild('searchResult') searchResult: ElementRef;

  @Output() setCurrentForm = new EventEmitter<FindAccountComponent>();
  @Output() accountFoundEvent = new EventEmitter<AccountFound>();

  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public formFields = InputFields;
  public submitted = false;
  public accountFound: boolean;
  public remainingAttempts: number;

  private subscriptions = new Subscription();

  constructor(
    private FormBuilder: UntypedFormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private findUsernameService: FindUsernameService,
  ) {}

  ngOnInit() {
    const formConfigs = {};
    this.formFields.forEach((field) => {
      const validators = [Validators.required, Validators.maxLength(field.maxlength)];
      if (field.pattern) {
        validators.push(Validators.pattern(field.pattern));
      }
      formConfigs[field.id] = ['', { validators, updateOn: 'submit' }];
    });

    this.form = this.FormBuilder.group(formConfigs);
    this.setupFormErrorsMap();
    this.setCurrentForm.emit(this);
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = this.formFields.map((field) => {
      const errorMap = {
        item: field.id,
        type: [
          { name: 'required', message: `Enter your ${lowerFirst(field.label)}` },
          {
            name: 'maxlength',
            message: `Your ${lowerFirst(field.label)} must be ${field.maxlength} characters or fewer`,
          },
        ],
      };
      if (field.id === 'email') {
        errorMap.type.push({
          name: 'pattern',
          message: 'Enter the email address in the correct format, like name@example.com',
        });
      }

      return errorMap;
    });
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit() {
    this.submitted = true;

    if (!this.form.valid) {
      return;
    }

    this.subscriptions.add(
      this.findUsernameService.findUserAccount(this.form.value).subscribe((response) => this.handleResponse(response)),
    );
  }

  public handleResponse(response: FindUserAccountResponse): void {
    switch (response?.accountFound) {
      case true:
        this.accountFound = true;
        this.accountFoundEvent.emit(response);
        break;
      case false:
        this.accountFound = false;
        this.remainingAttempts = response.remainingAttempts;
        // TODO for #1570:  navigate to error page when remaining attempt = 0
        break;
    }

    setTimeout(() => {
      this.scrollToResult();
    }, 0);
  }

  private scrollToResult() {
    this.searchResult.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
