import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ElementRef, OnInit, ViewChild, Directive } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { POSTCODE_PATTERN } from '@core/constants/constants';
import { LocationSearchResponse } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { Subscription } from 'rxjs';

@Directive()
export class WorkplaceNotFound implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public serverError: string;
  public submitted: boolean;
  protected flow: string;
  private subscriptions: Subscription = new Subscription();

  constructor(
    protected formBuilder: FormBuilder,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected locationService: LocationService,
    protected router: Router,
  ) {}

  ngOnInit() {
    this.init();
    this.form = this.formBuilder.group({
      postcode: [null, this.postcodeValidator],
    });
    this.backService.setBackLink({ url: [this.flow, 'regulated-by-cqc'] });
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected init() {}

  protected onSuccess(data: LocationSearchResponse): void {}

  public getFormErrorMessage(): string {
    const errorType = Object.keys(this.postcodeControl.errors)[0];
    return this.errorSummaryService.getFormErrorMessage('postcode', errorType, this.formErrorsMap);
  }

  public onSubmit() {
    this.submitted = true;
    if (this.form.valid) {
      this.subscriptions.add(
        this.locationService.getAddressesByPostCode(this.postcodeControl.value).subscribe(
          (data: LocationSearchResponse) => this.onSuccess(data),
          (error: HttpErrorResponse) => this.onError(error),
        ),
      );
    }
  }

  private onError(error: HttpErrorResponse): void {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  protected navigateToSelectWorkplaceAddressRoute() {
    this.router.navigate([this.flow, 'select-workplace-address']);
  }

  private postcodeValidator(control: AbstractControl) {
    return !control.value || POSTCODE_PATTERN.test(control.value) ? null : { validPostcode: true };
  }

  get formErrorsMap() {
    return [
      {
        item: 'postcode',
        type: [
          {
            name: 'required',
            message: 'Enter a postcode.',
          },
          {
            name: 'validPostcode',
            message: 'Enter a real postcode.',
          },
        ],
      },
    ];
  }

  get serverErrorsMap() {
    return [
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

  get postcodeControl() {
    return this.form.get('postcode');
  }
}
