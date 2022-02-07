import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wdf-grant-letter',
  templateUrl: './wdf-grant-letter.component.html',
})
export class WdfGrantLetterComponent implements OnInit, OnDestroy {
  public options = ['Myself', 'Somebody else'];

  public workplace: Establishment;
  public workplaceUid: string;
  public primaryWorkplaceUid: string;
  public form: FormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails> = [];
  public flow: string;
  public revealTitle = "What's a grant letter?";

  private subscriptions: Subscription = new Subscription();

  constructor(
    protected formBuilder: FormBuilder,
    public errorSummaryService: ErrorSummaryService,
    protected router: Router,
  ) {
    this.form = this.formBuilder.group(
      {
        grantLetter: [null, Validators.required],
        fullName: [null],
        emailAddress: [null],
      },
      { Validators: this.postcodeValidator },
    );
  }

  ngOnInit(): void {
    this.setupFormErrorsMap();
    this.flow = 'wdf-claims';
  }

  public onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      this.navigateToNextPage();
    }
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'grantLetter',
        type: [
          {
            name: 'required',
            message: 'Please select who you want to email Grant Letter',
          },
        ],
      },
      {
        item: 'fullName',
        type: [
          {
            name: 'required',
            message: 'Please enter full name',
          },
        ],
      },
      {
        item: 'emailAddress',
        type: [
          {
            name: 'required',
            message: 'Please enter email address',
          },
        ],
      },
    ];
  }
  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }
  postcodeValidator() {
    const grantletter = this.form.value.grantLetter;
    return grantletter ? 'Myself' : null;
  }
  public navigateToNextPage(): void {
    this.router.navigate([this.flow, 'grant-letter-sent']);
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
