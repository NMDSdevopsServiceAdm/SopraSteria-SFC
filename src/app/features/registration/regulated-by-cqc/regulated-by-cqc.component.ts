import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LocationSearchResponse } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

@Component({
  selector: 'app-regulated-by-cqc',
  templateUrl: './regulated-by-cqc.component.html',
})
export class RegulatedByCqcComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
  public submitted = false;

  constructor(
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get regulatedByCQC() {
    return this.form.get('regulatedByCQC');
  }

  get group() {
    return this.form.get('group');
  }

  get regulatedPostcode() {
    return this.group.get('regulatedPostcode');
  }

  get locationId() {
    return this.group.get('locationId');
  }

  get nonRegulatedPostcode() {
    return this.form.get('nonRegulatedPostcode');
  }

  ngOnInit() {
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.setBackLink();
    this.setupSubscription();
  }

  private setupForm(): void {
    this.form = this.fb.group({
      regulatedByCQC: [null, Validators.required],
      group: this.fb.group({
        regulatedPostcode: ['', Validators.maxLength(8)],
        locationId: ['', Validators.maxLength(50)],
      }),
      nonRegulatedPostcode: ['', Validators.maxLength(8)],
    });
  }

  public onRegulatedByCQCTruthy(): void {
    this.group.setValidators([CustomValidators.checkMultipleInputValues]);
    this.nonRegulatedPostcode.setValue('');
    this.group.updateValueAndValidity();

    this.nonRegulatedPostcode.setValidators(Validators.maxLength(8));
    this.nonRegulatedPostcode.updateValueAndValidity();
  }

  public onRegulatedByCQCFalsy(): void {
    this.group.clearValidators();
    this.regulatedPostcode.setValue('');
    this.locationId.setValue('');
    this.group.updateValueAndValidity();

    this.nonRegulatedPostcode.setValidators([Validators.required, Validators.maxLength(8)]);
    this.nonRegulatedPostcode.updateValueAndValidity();
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'regulatedByCQC',
        type: [
          {
            name: 'required',
            message: 'Please specify if you are regulated by CQC.',
          },
        ],
      },
      {
        item: 'group',
        type: [
          {
            name: 'bothAreEmpty',
            message: 'Postcode and location ID are both empty. Please fill out one field.',
          },
          {
            name: 'bothHaveContent',
            message: 'Postcode and location ID are both entered. Please fill out one field.',
          },
        ],
      },
      {
        item: 'group.regulatedPostcode',
        type: [
          {
            name: 'maxlength',
            message: 'Your postcode must be no longer than 8 characters.',
          },
        ],
      },
      {
        item: 'group.locationId',
        type: [
          {
            name: 'maxlength',
            message: 'Your location ID must be no longer than 50 characters.',
          },
        ],
      },
      {
        item: 'nonRegulatedPostcode',
        type: [
          {
            name: 'required',
            message: 'Please enter your postcode.',
          },
          {
            name: 'maxlength',
            message: 'Your postcode must be no longer than 8 characters.',
          },
        ],
      },
    ];
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 404,
        message: 'No location found.',
      },
      {
        name: 400,
        message: 'Invalid Postcode.',
      },
      {
        name: 503,
        message: 'Database error.',
      },
    ];
  }

  /**
   * If a user chooses submits a postcode that throws a server side error
   * and changes cqc radio selection
   * then remove server side error
   */
  private setupSubscription(): void {
    this.subscriptions.add(this.regulatedByCQC.valueChanges.pipe(skip(1)).subscribe(() => (this.serverError = null)));
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.save();
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

  private save(): void {
    if (this.regulatedByCQC.value === 'yes') {
      if (this.regulatedPostcode.value.length) {
        this.subscriptions.add(
          this.registrationService
            .getLocationByPostCode(this.regulatedPostcode.value)
            .subscribe(
              (data: LocationSearchResponse) => this.onSuccess(data),
              (error: HttpErrorResponse) => this.onError(error)
            )
        );
      } else if (this.locationId.value.length) {
        this.subscriptions.add(
          this.registrationService
            .getLocationByLocationId(this.locationId.value)
            .subscribe(
              (data: LocationSearchResponse) => this.onSuccess(data),
              (error: HttpErrorResponse) => this.onError(error)
            )
        );
      }
    } else if (this.regulatedByCQC.value === 'no') {
      if (this.nonRegulatedPostcode.value.length) {
        this.subscriptions.add(
          this.registrationService
            .getAddressesByPostCode(this.nonRegulatedPostcode.value)
            .subscribe(
              (data: LocationSearchResponse) => this.onSuccess(data),
              (error: HttpErrorResponse) => this.onError(error)
            )
        );
      }
    }
  }

  private onSuccess(data: LocationSearchResponse): void {
    this.registrationService.registrationInProgress$.next(true);

    if (data.success === 1) {
      this.registrationService.locationAddresses$.next(data.locationdata || data.postcodedata);
      if (data.locationdata) {
        this.router.navigate(['/registration/select-workplace']);
      } else {
        this.router.navigate(['/registration/select-workplace-address']);
      }
    }
  }

  private onError(error: HttpErrorResponse): void {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  private setBackLink(): void {
    this.backService.setBackLink({ url: ['/login'] });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
