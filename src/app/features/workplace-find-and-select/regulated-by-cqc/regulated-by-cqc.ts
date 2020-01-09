import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LocationSearchResponse } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

export class RegulatedByCQC implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl', { static: false }) formEl: ElementRef;
  protected flow: string;
  protected serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  protected isCQCLocationUpdate: boolean;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public submitted = false;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected locationService: LocationService,
    protected route: ActivatedRoute,
    protected router: Router
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
    this.setupSubscription();
    this.init();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected init(): void {}

  protected setBackLink(): void {}

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      regulatedByCQC: [null, Validators.required],
      group: this.formBuilder.group({
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
  public validateLocationChange(): void {
    this.regulatedByCQC.setValue('yes');
    this.group.setValidators([CustomValidators.checkMultipleInputValues]);
    this.nonRegulatedPostcode.setValue('');
    this.group.updateValueAndValidity();
  }

  protected setupFormErrorsMap(): void {
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

  protected setupServerErrorsMap(): void {
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

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private save(): void {
    if (this.regulatedByCQC.value === 'yes') {
      if (this.regulatedPostcode.value.length) {
        if(this.isCQCLocationUpdate){
          this.subscriptions.add(
          this.locationService.getUnassignedLocationByPostCode(this.regulatedPostcode.value).subscribe(
            (data: LocationSearchResponse) => this.onSuccess(data),
            (error: HttpErrorResponse) => this.onError(error)
          )
        );
        } else {
          this.subscriptions.add(
          this.locationService.getLocationByPostCode(this.regulatedPostcode.value).subscribe(
            (data: LocationSearchResponse) => this.onSuccess(data),
            (error: HttpErrorResponse) => this.onError(error)
          )
        );
        }

      } else if (this.locationId.value.length) {
         if(this.isCQCLocationUpdate){
           this.subscriptions.add(
          this.locationService.getUnassignedLocationByLocationId(this.locationId.value).subscribe(
            (data: LocationSearchResponse) => this.onSuccess(data),
            (error: HttpErrorResponse) => this.onError(error)
          )
        );
         } else {
           this.subscriptions.add(
          this.locationService.getLocationByLocationId(this.locationId.value).subscribe(
            (data: LocationSearchResponse) => this.onSuccess(data),
            (error: HttpErrorResponse) => this.onError(error)
          )
        );
         }

      }
    } else if (this.regulatedByCQC.value === 'no') {
      if (this.nonRegulatedPostcode.value.length) {
        this.subscriptions.add(
          this.locationService.getAddressesByPostCode(this.nonRegulatedPostcode.value).subscribe(
            (data: LocationSearchResponse) => this.onSuccess(data),
            (error: HttpErrorResponse) => this.onError(error)
          )
        );
      }
    }
  }

  protected onSuccess(data: LocationSearchResponse): void {}

  protected onLocationFailure(): void {}

  protected navigateToNextRoute(data: LocationSearchResponse): void {
    if (data.locationdata) {
      this.router.navigate([`${this.flow}/select-workplace`]);
    } else {
      this.router.navigate([`${this.flow}/select-workplace-address`]);
    }
  }

  protected navigateToWorkplaceNotFoundRoute() {
    this.router.navigate([this.flow, 'workplace-not-found']);
  }

  private onError(error: HttpErrorResponse): void {
    if (error.status === 404) {
      this.onLocationFailure();
      return;
    }
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
