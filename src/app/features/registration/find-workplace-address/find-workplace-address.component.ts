import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LocationSearchResponse } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { Subscription } from 'rxjs';
import { LocationService } from '@core/services/location.service';

@Component({
  selector: 'app-find-workplace-address',
  templateUrl: './find-workplace-address.component.html',
})
export class FindWorkplaceAddressComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public serverError: string;
  public submitted = false;
  private formErrorsMap: Array<ErrorDetails>;
  private serverErrorsMap: Array<ErrorDefinition>;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private fb: FormBuilder,
    private locationService: LocationService,
    private registrationService: RegistrationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.setBackLink();
  }

  get getPostcode() {
    return this.form.get('postcode');
  }

  private setupForm(): void {
    this.form = this.fb.group({
      postcode: ['', [Validators.required, Validators.maxLength(8)]],
    });
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'postcode',
        type: [
          {
            name: 'required',
            message: 'Please enter a postcode.',
          },
          {
            name: 'maxlength',
            message: 'Invalid postcode.',
          },
        ],
      },
    ];
  }

  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'No results found.',
      },
      {
        name: 404,
        message: 'Invalid postcode.',
      },
      {
        name: 503,
        message: 'Database error.',
      },
    ];
  }

  private getAddressesByPostCode(): void {
    this.subscriptions.add(
      this.locationService.getAddressesByPostCode(this.getPostcode.value).subscribe(
        (data: LocationSearchResponse) => {
          this.registrationService.locationAddresses$.next(data.postcodedata);
          this.router.navigate(['/registration/select-workplace-address']);
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        }
      )
    );
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.getAddressesByPostCode();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/select-workplace-address'] });
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
