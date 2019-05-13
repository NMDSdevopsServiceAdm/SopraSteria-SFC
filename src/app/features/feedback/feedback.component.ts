import { Component, OnDestroy, OnInit } from '@angular/core';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FeedbackModel } from '@core/model/feedback.model';
import { FeedbackService } from '@core/services/feedback.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { WindowRef } from '@core/services/window.ref';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
})
export class FeedbackComponent implements OnInit, OnDestroy {
  private _pendingFeedback = true;
  private doingWhatCharacterLimit = 500;
  private emailCharacterLimit = 120;
  private form: FormGroup;
  private formErrorsMap: Array<ErrorDetails>;
  private fullNameCharacterLimit = 120;
  private serverError: string;
  private serverErrorsMap: Array<ErrorDefinition>;
  private submitted = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private errorSummaryService: ErrorSummaryService,
    private feedbackService: FeedbackService,
    private formBuilder: FormBuilder,
    private windowRef: WindowRef
  ) {}

  ngOnInit() {
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      doingWhat: [null, [Validators.required, Validators.maxLength(this.doingWhatCharacterLimit)]],
      email: [null, [Validators.email, Validators.maxLength(this.emailCharacterLimit)]],
      fullname: [null, [Validators.maxLength(this.fullNameCharacterLimit)]],
      tellUs: [null, [Validators.required, CustomValidators.maxWords(10)]],
    });
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'doingWhat',
        type: [
          {
            name: 'required',
            message: 'Please tell us what you were trying to do.',
          },
          {
            name: 'maxlength',
            message: `Character limit of ${this.doingWhatCharacterLimit} exceeded.`,
          },
        ],
      },
      {
        item: 'email',
        type: [
          {
            name: 'email',
            message: 'Please enter a valid email address.',
          },
          {
            name: 'maxlength',
            message: `Character limit of ${this.emailCharacterLimit} exceeded.`,
          },
        ],
      },
      {
        item: 'fullname',
        type: [
          {
            name: 'maxlength',
            message: `Character limit of ${this.fullNameCharacterLimit} exceeded.`,
          },
        ],
      },
      {
        item: 'tellUs',
        type: [
          {
            name: 'required',
            message: 'Please tell us your feedback.',
          },
          {
            name: 'maxwords',
            message: 'Maximum word count exceeded.',
          },
        ],
      },
    ];
  }

  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'We could not submit your feedback. You can try again or contact us',
      },
    ];
  }

  get pendingFeedback(): boolean {
    return this._pendingFeedback;
  }

  resetPendingFeedback() {
    this._pendingFeedback = false;
  }

  closeWindow() {
    this.windowRef.nativeWindow.close();
  }

  private onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      if (this.pendingFeedback) {
        const { doingWhat, tellUs, fullname, email } = this.form.controls;

        const request: FeedbackModel = {
          doingWhat: doingWhat.value,
          tellUs: tellUs.value,
          name: fullname.value,
          email: email.value,
        };

        this.subscriptions.add(
          this.feedbackService.post(request).subscribe(
            () => this.resetPendingFeedback(),
            (error: HttpErrorResponse) => {
              this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
              this.errorSummaryService.scrollToErrorSummary();
            }
          )
        );
      }
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
