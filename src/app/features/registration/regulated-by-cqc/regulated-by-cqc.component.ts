import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegistrationModel } from '@core/model/registration.model';
import { RegistrationService } from '@core/services/registration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-regulated-by-cqc',
  templateUrl: './regulated-by-cqc.component.html',
})
export class RegulatedByCqcComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  private registration: RegistrationModel;
  public submitted = false;

  public formErrorsMap: Array<ErrorDetails>;
  public serverErrorsMap: Array<ErrorDefinition>;
  public serverError: string;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private registrationService: RegistrationService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private errorSummaryService: ErrorSummaryService
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

    this.subscriptions.add(
      this.registrationService.registration$.subscribe((registration: RegistrationModel) => this.registration = registration)
    );
  }

  private setupForm(): void {
    this.form = this.fb.group({
      regulatedByCQC: [null, Validators.required],
      group: this.fb.group(
        {
          regulatedPostcode: ['', Validators.maxLength(8)],
          locationId: ['', Validators.maxLength(50)],
        },
      ),
      nonRegulatedPostcode: ['', Validators.maxLength(8)],
    });
  }

  public onRegulatedByCQCTruthy(): void {
    this.group.setValidators([CustomValidators.checkMultipleInputValues]);
    this.group.updateValueAndValidity();

    this.nonRegulatedPostcode.setValidators(Validators.maxLength(8));
    this.nonRegulatedPostcode.updateValueAndValidity();
  }

  public onRegulatedByCQCFalsy(): void {
    this.group.clearValidators();
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
        item: 'regulatedPostcode',
        type: [
          {
            name: 'maxlength',
            message: 'Your postcode must be no longer than 8 characters.',
          },
        ],
      },
      {
        item: 'locationId',
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
    if (this.regulatedPostcode.value.length) {
      this.subscriptions.add(
        this.registrationService.getLocationByPostCode(this.regulatedPostcode.value).subscribe(
          (data: RegistrationModel) => this.onSuccess(data),
          (error: HttpErrorResponse) => this.onError(error)
        )
      );
    } else if (this.locationId.value.length) {
      this.subscriptions.add(
        this.registrationService.getLocationByLocationId(this.locationId.value).subscribe(
          (data: RegistrationModel) => this.onSuccess(data),
          (error: HttpErrorResponse) => this.onError(error)
        )
      );
    } else if (this.nonRegulatedPostcode.value.length) {
      this.subscriptions.add(
        this.registrationService.getAddressByPostCode(this.nonRegulatedPostcode.value).subscribe(
          (data: RegistrationModel) => this.onSuccess(data),
          (error: HttpErrorResponse) => this.onError(error)
        )
      );
    }
  }

  private onSuccess(data: RegistrationModel): void {
    if (data.success === 1) {
      this.registrationService.locationAddresses$.next(data.locationdata || data.postcodedata);
      if (data.locationdata) {
        this.router.navigate([ '/registration/select-workplace' ]);
      } else {
        this.router.navigate([ '/registration/select-workplace-address' ]);
      }
    }
  }

  private onError(error: HttpErrorResponse): void {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
