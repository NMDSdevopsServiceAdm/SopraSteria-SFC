import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { FeedbackModel } from '@core/model/feedback.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FeedbackService } from '@core/services/feedback.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
})
export class FeedbackComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public submitted = false;
  public serverError: string;
  public doingWhatCharacterLimit = 500;
  public tellUsCharactersLimit = 500;
  private formErrorsMap: Array<ErrorDetails>;
  private serverErrorsMap: Array<ErrorDefinition>;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private errorSummaryService: ErrorSummaryService,
    private feedbackService: FeedbackService,
    private formBuilder: UntypedFormBuilder,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.PUBLIC);
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      doingWhat: [null, [Validators.required, Validators.maxLength(this.doingWhatCharacterLimit)]],
      tellUs: [null, [Validators.required, Validators.maxLength(this.tellUsCharactersLimit)]],
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
        item: 'tellUs',
        type: [
          {
            name: 'required',
            message: 'Please tell us your feedback.',
          },
          {
            name: 'maxlength',
            message: 'Maximum word count exceeded.',
          },
        ],
      },
    ];
  }

  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 500,
        message: 'We could not submit your feedback. You can try again or contact us',
      },
    ];
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      const { doingWhat, tellUs } = this.form.controls;

      const request: FeedbackModel = {
        doingWhat: doingWhat.value,
        tellUs: tellUs.value,
      };

      this.subscriptions.add(
        this.feedbackService.post(request).subscribe(
          () => {
            this.router.navigate(['/thank-you']);
          },
          (error: HttpErrorResponse) => {
            this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
            this.errorSummaryService.scrollToErrorSummary();
          },
        ),
      );
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
