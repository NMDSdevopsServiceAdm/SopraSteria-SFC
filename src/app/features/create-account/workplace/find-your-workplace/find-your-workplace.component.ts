import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LocationSearchResponse } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { RegistrationService } from '@core/services/registration.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-find-your-workplace',
  templateUrl: './find-your-workplace.component.html',
})
export class FindYourWorkplaceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('formEl') formEl: ElementRef;

  protected flow: string;
  protected serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  public submitted = false;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public returnToWorkplaceNotFound: boolean;

  constructor(
    protected router: Router,
    public backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private registrationService: RegistrationService,
    private locationService: LocationService,
  ) {}

  public ngOnInit(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.returnToWorkplaceNotFound = this.registrationService.workplaceNotFound$.value;
    this.setupForm();
    this.setupFormErrorsMap();
    this.setBackLink();
  }

  public ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public setBackLink(): void {
    const backLink = this.returnToWorkplaceNotFound ? 'new-workplace-not-found' : 'new-regulated-by-cqc';
    this.backService.setBackLink({ url: [this.flow, backLink] });
    this.registrationService.workplaceNotFound$.next(false);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      postcodeOrLocationID: [null, { validators: Validators.required, updateOn: 'submit' }],
    });
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

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'postcodeOrLocationID',
        type: [
          {
            name: 'required',
            message: `Enter your CQC location ID or your workplace postcode`,
          },
        ],
      },
    ];
  }

  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;
    const postcodeOrLocationID = this.form.get('postcodeOrLocationID').value;
    this.registrationService.postcodeOrLocationId$.next(postcodeOrLocationID);

    if (this.form.valid) {
      this.subscriptions.add(
        this.locationService.getLocationByPostcodeOrLocationID(postcodeOrLocationID).subscribe(
          (data: LocationSearchResponse) => this.onSuccess(data),
          (error: HttpErrorResponse) => this.onError(error),
        ),
      );
    }
  }

  protected onSuccess(data: LocationSearchResponse): void {
    this.registrationService.locationAddresses$.next(data.locationdata);
    this.registrationService.searchMethod$.next(data.searchmethod);
    this.navigateToNextRoute(data);
  }

  private onError(error: HttpErrorResponse): void {
    if (error.status === 404) {
      this.registrationService.searchMethod$.next(error.error.searchmethod);
      this.router.navigate([this.flow, 'new-workplace-not-found']);
      return;
    }
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  private navigateToNextRoute(data: LocationSearchResponse): void {
    if (data.locationdata.length === 1) {
      this.router.navigate([this.flow, 'your-workplace']);
    } else {
      this.router.navigate([this.flow, 'select-workplace']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
