import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { lowerFirst } from 'lodash';
import { FindUsernameService } from '../../../../core/services/find-username.service';
import { Subscription } from 'rxjs';

const Fields = [
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
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;
  public formFields = Fields;

  @Input() public serverError: string;
  @Input() public accountFound: false;
  @Output() setCurrentForm = new EventEmitter<FindAccountComponent>();

  constructor(
    private FormBuilder: UntypedFormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private findUsernameService: FindUsernameService,
  ) {}

  ngOnInit() {
    const formElements = {};
    Fields.forEach((field) => {
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
    this.formErrorsMap = Fields.map((field) => {
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

  onSubmit() {
    this.submitted = true;

    if (this.form.valid) {
      this.findUsernameService.findUserAccount(this.form.value);
    }
  }
}
