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
      didYouDoEverythingAdditionalAnswer: [null, Validators.maxLength(this.didYouDoEverythingMaxLength)],
      howDidYouFeel: null,
    });

    route.queryParams.subscribe((params) => (this.wid = params.wid));

    this.setupFormErrorsMap();
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    this.http.post('/api/satisfactionSurvey', { establishmentId: this.wid, ...this.form.value }).subscribe();
    this.router.navigate(['/login']);
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'didYouDoEverythingAdditionalAnswer',
        type: [
          {
            name: 'maxlength',
            message: `What stopped you must be ${this.didYouDoEverythingMaxLength} characters or fewer`,
          },
        ],
      },
    ];
  }
}
