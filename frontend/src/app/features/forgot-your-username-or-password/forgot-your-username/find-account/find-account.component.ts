import { lowerFirst } from 'lodash';
import { Subscription } from 'rxjs';

import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { AccountFound, FindUserAccountResponse, FindUsernameService } from '@core/services/find-username.service';

const InputFields = [
  { id: 'name', label: 'Name', maxlength: 120 },
  { id: 'workplaceIdOrPostcode', label: 'Workplace ID or postcode', maxlength: 8 },
  { id: 'email', label: 'Email address', maxlength: 120 },
];

@Component({
  selector: 'app-find-account',
  templateUrl: './find-account.component.html',
  styleUrls: ['./find-account.component.scss'],
})
export class FindAccountComponent {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public formFields = InputFields;

  public submitted = false;
  public accountFound: boolean;
  public remainingAttempts: number;

  private subscriptions = new Subscription();

  @Output() setCurrentForm = new EventEmitter<FindAccountComponent>();
  @Output() accountFoundEvent = new EventEmitter<AccountFound>();

  constructor(
    private FormBuilder: UntypedFormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private findUsernameService: FindUsernameService,
  ) {}

  ngOnInit() {
    const formElements = {};
    InputFields.forEach((field) => {
      formElements[field.id] = [
        '',
        { validators: [Validators.required, Validators.maxLength(field.maxlength)], updateOn: 'submit' },
      ];
    });

    this.form = this.FormBuilder.group(formElements);
    this.setupFormErrorsMap();
    this.setCurrentForm.emit(this);
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = InputFields.map((field) => {
      return {
        item: field.id,
        type: [
          {
            name: 'required',
            message: `Enter your ${lowerFirst(field.label)}`,
          },
          {
            name: 'maxlength',
            message: `Your ${lowerFirst(field.label)} must be ${field.maxlength} characters or fewer`,
          },
        ],
      };
    });
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public handleFindUserAccountResponse(response: FindUserAccountResponse): void {
    switch (response?.accountFound) {
      case true:
        this.accountFound = true;
        // emit info to parent
        break;
      case false:
        this.accountFound = false;
        this.remainingAttempts = response.remainingAttempts;
        // to navigate to error page when remaining attempt = 0
        break;
    }
  }

  public onSubmit() {
    this.submitted = true;

    if (!this.form.valid) {
      return;
    }

    this.subscriptions.add(
      this.findUsernameService
        .findUserAccount(this.form.value)
        .subscribe((response) => this.handleFindUserAccountResponse(response)),
    );
  }
}
