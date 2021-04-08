import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';

@Component({
  selector: 'app-contact-us-or-leave-feedback',
  templateUrl: './contact-us-or-leave-feedback.component.html',
})
export class ContactUsOrLeaveFeedbackComponent {
  public form: FormGroup;
  public submitted = false;
  public formErrorsMap: ErrorDetails[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
  ) {
    this.setupForm();
  }

  get contactUsOrFeedback() {
    return this.form.get('contactUsOrFeedback').value;
  }

  continue() {
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
      this.continue();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  protected setupForm(): void {
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
