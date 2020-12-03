import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';

@Component({
  selector: 'app-satisfaction-survey',
  templateUrl: './satisfaction-survey.component.html',
})
export class SatisfactionSurveyComponent {
  @ViewChild('formEl') formEl: ElementRef;
  private wid: string;
  public form: FormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;
  public didYouDoEverythingMaxLength = 500;

  constructor(
    private http: HttpClient,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    route: ActivatedRoute,
    formBuilder: FormBuilder,
  ) {
    this.form = formBuilder.group({
      didYouDoEverything: null,
      whatStoppedYouDoingEverything: [null, Validators.maxLength(this.didYouDoEverythingMaxLength)],
      whatStoppedYouDoingAnything: [null, Validators.maxLength(this.didYouDoEverythingMaxLength)],
      howDidYouFeel: null,
    });

    route.queryParams.subscribe((params) => (this.wid = params.wid));

    this.setupFormErrorsMap();
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const survey = this.buildSatisfactionSurveyBody(this.form.value);

    this.http.post('/api/satisfactionSurvey', survey).subscribe(
      () => this.navigateToLogin(),
      (err) => this.navigateToLogin(),
    );
  }

  private buildSatisfactionSurveyBody(formValue) {
    return {
      establishmentId: this.wid,
      didYouDoEverything: formValue.didYouDoEverything,
      didYouDoEverythingAdditionalAnswer: this.getAdditionalAnswer(formValue),
      howDidYouFeel: formValue.howDidYouFeel,
    };
  }

  private getAdditionalAnswer(formValue) {
    if (formValue.didYouDoEverything == 'Some') {
      return formValue.whatStoppedYouDoingEverything;
    }
    if (formValue.didYouDoEverything == 'No') {
      return formValue.whatStoppedYouDoingAnything;
    }
    return null;
  }

  public didYouDoEverythingChanged() {
    this.form.patchValue({ whatStoppedYouDoingEverything: null, whatStoppedYouDoingAnything: null });
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = ['whatStoppedYouDoingEverything', 'whatStoppedYouDoingAnything'].map((item) => {
      return {
        item: item,
        type: [
          {
            name: 'maxlength',
            message: `What stopped you must be ${this.didYouDoEverythingMaxLength} characters or fewer`,
          },
        ],
      };
    });
  }
}
