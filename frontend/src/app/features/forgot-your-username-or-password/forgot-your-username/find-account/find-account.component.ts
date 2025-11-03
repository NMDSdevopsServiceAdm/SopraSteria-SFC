import { lowerFirst } from 'lodash';
import { Subscription } from 'rxjs';

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
    standalone: false
})
export class FindAccountComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  @ViewChild('searchResult') searchResult: ElementRef;

  @Output() setCurrentForm = new EventEmitter<FindAccountComponent>();
  @Output() accountFoundEvent = new EventEmitter<AccountFound>();

  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public formFields = InputFields;
  public submitted = false;
  public status: FindUserAccountResponse['status'];
  public remainingAttempts: number;
  public serverError: string;

  private subscriptions = new Subscription();

  constructor(
    private FormBuilder: UntypedFormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private findUsernameService: FindUsernameService,
    private router: Router,
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
    this.serverError = null;

    if (!this.form.valid) {
      return;
    }

    this.subscriptions.add(
      this.findUsernameService.findUserAccount(this.form.value).subscribe((response) => this.handleResponse(response)),
    );
  }

  public handleResponse(response: FindUserAccountResponse): void {
    switch (response?.status) {
      case 'AccountFound':
        this.status = 'AccountFound';
        this.accountFoundEvent.emit(response);
        break;

      case 'AccountNotFound':
        this.status = 'AccountNotFound';
        this.remainingAttempts = response.remainingAttempts;

        if (this.remainingAttempts === 0) {
          this.router.navigate(['/user-account-not-found']);
        }

        this.scrollToResult();
        break;

      case 'MultipleAccountsFound':
        this.status = 'MultipleAccountsFound';
        this.remainingAttempts = null;

        this.scrollToResult();
        break;

      case 'AccountLocked':
        this.serverError = 'There is a problem with your account, please contact the Support Team on 0113 241 0969';
        this.status = 'AccountLocked';
        this.remainingAttempts = null;
        break;
    }
  }

  private scrollToResult() {
    setTimeout(() => {
      this.searchResult.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
