import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FeedbackService } from '@core/services/feedback.service';

@Component({
  selector: 'app-contact-us-or-leave-feedback',
  templateUrl: './contact-us-or-leave-feedback.component.html',
})
export class ContactUsOrLeaveFeedbackComponent {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public submitted = false;
  public formErrorsMap: ErrorDetails[] = [];
  public returnTo: URLStructure;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private breadcrumbService: BreadcrumbService,
    private feedbackService: FeedbackService,
  ) {
    this.setupForm();
  }

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.PUBLIC);
    this.returnTo = this.feedbackService.returnTo ? this.feedbackService.returnTo : { url: ['/dashboard'] };
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  get contactUsOrFeedback() {
    return this.form.get('contactUsOrFeedback').value;
  }

  private navigateToNextPage() {
    if (this.contactUsOrFeedback === 'feedback') {
      this.router.navigate(['/feedback']);
    } else if (this.contactUsOrFeedback === 'contactUs') {
      this.router.navigate(['/contact-us']);
    }
  }

  public onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.navigateToNextPage();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private setupForm(): void {
    this.submitted = false;
    this.form = this.formBuilder.group({
      contactUsOrFeedback: [
        null,
        {
          validators: [Validators.required],
          updateOn: 'submit',
        },
      ],
    });

    this.formErrorsMap.push({
      item: `contactUsOrFeedback`,
      type: [
        {
          name: 'required',
          message: `Select if you want to contact us or leave feedback`,
        },
      ],
    });
  }
}
